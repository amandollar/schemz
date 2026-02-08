import B2 from 'backblaze-b2';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Backblaze B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

let authorized = false;
let bucketId = null;
let downloadUrl = null; // Native B2 download URL from authorization

/**
 * Authorize Backblaze B2 client and get bucket ID
 * @returns {Promise<void>}
 */
const authorizeB2 = async () => {
  if (!authorized) {
    try {
      const response = await b2.authorize();
      
      // Store the downloadUrl from authorization response
      // Format: https://f{number}.backblazeb2.com
      downloadUrl = response.data.downloadUrl;
      
      // Get bucket ID from bucket name
      const bucketName = process.env.B2_BUCKET_NAME;
      if (bucketName) {
        const { data: buckets } = await b2.listBuckets();
        const bucket = buckets.buckets.find(b => b.bucketName === bucketName);
        if (bucket) {
          bucketId = bucket.bucketId;
        } else {
          throw new Error(`Bucket "${bucketName}" not found`);
        }
      } else {
        throw new Error('B2_BUCKET_NAME is not set in environment variables');
      }
      
      authorized = true;
    } catch (error) {
      console.error('Backblaze B2 authorization error:', error);
      throw new Error(`Failed to authorize with Backblaze B2: ${error.message}`);
    }
  }
};

/**
 * Upload a document to Backblaze B2
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - The folder path (e.g., 'marksheets', 'certificates', 'other-documents')
 * @param {string} originalFilename - The original filename with extension (e.g., 'marksheet.pdf')
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadDocument = async (fileBuffer, folder = 'documents', originalFilename = null) => {
  try {
    // Authorize if not already authorized
    await authorizeB2();

    if (!bucketId) {
      throw new Error('Bucket ID not found');
    }

    // Generate filename
    let filename;
    if (originalFilename) {
      // Extract extension
      const ext = originalFilename.split('.').pop().toLowerCase();
      // Remove extension and sanitize filename
      const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
      // Add timestamp for uniqueness
      const timestamp = Date.now();
      filename = `${folder}/${sanitizedName}_${timestamp}.${ext}`;
    } else {
      const timestamp = Date.now();
      filename = `${folder}/document_${timestamp}.pdf`;
    }

    // Get upload URL
    const { data: uploadUrlData } = await b2.getUploadUrl({ bucketId });
    const { uploadUrl, authorizationToken } = uploadUrlData;

    // Upload file
    await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: filename,
      data: fileBuffer,
      contentLength: fileBuffer.length,
      contentType: originalFilename?.endsWith('.pdf') 
        ? 'application/pdf' 
        : originalFilename?.match(/\.(jpg|jpeg)$/i) 
        ? 'image/jpeg' 
        : originalFilename?.match(/\.png$/i)
        ? 'image/png'
        : 'application/octet-stream',
    });

    // For private buckets, generate a signed URL
    // Signed URLs are valid for a specific duration (default: 1 hour)
    const bucketName = process.env.B2_BUCKET_NAME;
    const signedUrlDuration = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Generate signed download authorization
    const { data: authData } = await b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: filename,
      validDurationInSeconds: signedUrlDuration,
    });
    
    if (!downloadUrl) {
      throw new Error('Download URL not available. Authorization may have failed.');
    }
    
    // Return signed URL for private bucket access
    // Format: {downloadUrl}/file/{bucketName}/{fileName}?Authorization={token}
    return `${downloadUrl}/file/${bucketName}/${filename}?Authorization=${authData.authorizationToken}`;
  } catch (error) {
    console.error('Backblaze B2 upload error:', error);
    throw new Error(`Failed to upload document to Backblaze B2: ${error.message}`);
  }
};

/**
 * Get a signed URL for a document (for private buckets)
 * @param {string} fileName - The file name/path in B2
 * @param {number} validDurationInSeconds - How long the URL should be valid (default: 1 hour)
 * @returns {Promise<string>} - The signed URL
 */
export const getSignedUrl = async (fileName, validDurationInSeconds = 3600) => {
  try {
    await authorizeB2();
    
    if (!bucketId) {
      throw new Error('Bucket ID not found');
    }
    
    const { data } = await b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: fileName,
      validDurationInSeconds,
    });

    const bucketName = process.env.B2_BUCKET_NAME;
    
    if (!downloadUrl) {
      throw new Error('Download URL not available. Authorization may have failed.');
    }
    
    // Use native B2 download URL format with authorization token
    return `${downloadUrl}/file/${bucketName}/${fileName}?Authorization=${data.authorizationToken}`;
  } catch (error) {
    console.error('Backblaze B2 signed URL error:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

export default b2;
