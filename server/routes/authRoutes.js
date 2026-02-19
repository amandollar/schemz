import express from 'express';
import multer from 'multer';
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  uploadProfileImage,
  uploadProfileDocuments
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', googleLogin);



// Configure multer for profile image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Multer for profile documents (PDF + images)
const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
    }
  }
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  if (err) {
    // Handle other multer-related errors (e.g., fileFilter errors)
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/upload-profile-image', protect, upload.single('image'), handleMulterError, uploadProfileImage);
router.post('/upload-profile-documents', protect,
  uploadDocuments.fields([
    { name: 'aadhaarDocument', maxCount: 1 },
    { name: 'incomeCertificate', maxCount: 1 },
    { name: 'categoryCertificate', maxCount: 1 }
  ]),
  handleMulterError,
  uploadProfileDocuments
);
router.put('/profile', protect, updateProfile);
router.post('/google', googleLogin);

export default router;
