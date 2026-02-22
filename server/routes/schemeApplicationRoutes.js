import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  submitApplication,
  getMyApplications,
  checkApplication,
  getSchemeApplications,
  getAllApplications,
  approveApplication,
  rejectApplication
} from '../controllers/schemeApplicationController.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF, JPG, JPEG, PNG
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
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
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

// User routes (only citizens can submit scheme applications)
router.post(
  '/',
  protect,
  authorize('user'),
  upload.fields([
    { name: 'marksheet', maxCount: 1 },
    { name: 'incomeCertificate', maxCount: 1 },
    { name: 'categoryCertificate', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
  ]),
  handleMulterError,
  submitApplication
);

router.get('/my-applications', protect, getMyApplications);
router.get('/check/:schemeId', protect, validateObjectId('schemeId'), checkApplication);

// Organizer/Admin routes
router.get('/scheme/:schemeId', protect, authorize('organizer', 'admin'), validateObjectId('schemeId'), getSchemeApplications);
router.get('/', protect, authorize('admin'), getAllApplications);
router.patch('/:id/approve', protect, authorize('organizer', 'admin'), validateObjectId('id'), approveApplication);
router.patch('/:id/reject', protect, authorize('organizer', 'admin'), validateObjectId('id'), rejectApplication);

export default router;
