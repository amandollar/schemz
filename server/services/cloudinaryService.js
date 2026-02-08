import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - The folder path in Cloudinary (default: 'uploads')
 * @param {string} resourceType - The resource type ('image', 'video', 'raw', 'auto') (default: 'auto')
 * @param {string} publicId - Optional public ID (filename) for the file
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadToCloudinary = async (
  fileBuffer,
  folder = 'uploads',
  resourceType = 'auto',
  publicId = null
) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = { 
      folder, 
      resource_type: resourceType,
      overwrite: false
    };
    
    // If publicId is provided, use it directly (we handle uniqueness in the caller)
    // Otherwise, let Cloudinary generate a unique ID
    if (publicId) {
      uploadOptions.public_id = publicId;
    } else {
      // Use Cloudinary's default behavior for generating unique IDs
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = true;
    }
    
    // For raw files (PDFs, documents), ensure proper format and resource type
    if (resourceType === 'raw') {
      // Explicitly set resource_type to 'raw' to prevent Cloudinary from auto-detecting as image
      uploadOptions.resource_type = 'raw';
      // Don't set format for raw files - let Cloudinary preserve the original format
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          // Verify the URL is correct for raw files
          let url = result.secure_url;
          if (resourceType === 'raw') {
            // Ensure URL uses /raw/upload/ instead of /image/upload/
            if (url.includes('/image/upload/')) {
              url = url.replace('/image/upload/', '/raw/upload/');
            }
            // Also check for other incorrect resource types
            if (url.includes('/video/upload/')) {
              url = url.replace('/video/upload/', '/raw/upload/');
            }
          }
          resolve(url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload a profile image to Cloudinary
 * @param {Buffer} fileBuffer - The image buffer to upload
 * @param {string} originalFilename - Optional original filename
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadProfileImage = async (fileBuffer, originalFilename = null) => {
  let publicId = null;
  if (originalFilename) {
    const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    publicId = `profile-images/${sanitizedName}`;
  }
  return uploadToCloudinary(fileBuffer, 'profile-images', 'image', publicId);
};

/**
 * @deprecated Use backblazeService.uploadDocument instead
 * Upload a document to Cloudinary - DEPRECATED, use Backblaze B2 for documents
 * This function is kept for backward compatibility but documents should use Backblaze B2
 */
export const uploadDocument = async (fileBuffer, folder = 'documents', originalFilename = null) => {
  console.warn('uploadDocument to Cloudinary is deprecated. Use Backblaze B2 for documents.');
  // Keep old implementation for backward compatibility but log warning
  let publicId = null;
  if (originalFilename) {
    const ext = originalFilename.split('.').pop().toLowerCase();
    const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const timestamp = Date.now();
    publicId = `${sanitizedName}_${timestamp}.${ext}`;
  }
  return uploadToCloudinary(fileBuffer, folder, 'raw', publicId);
};

export default cloudinary;
