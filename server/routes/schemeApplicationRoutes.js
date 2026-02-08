import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
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

// User routes
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'marksheet', maxCount: 1 },
    { name: 'incomeCertificate', maxCount: 1 },
    { name: 'categoryCertificate', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
  ]),
  submitApplication
);

router.get('/my-applications', protect, getMyApplications);
router.get('/check/:schemeId', protect, checkApplication);

// Organizer/Admin routes
router.get('/scheme/:schemeId', protect, authorize('organizer', 'admin'), getSchemeApplications);
router.get('/', protect, authorize('admin'), getAllApplications);
router.patch('/:id/approve', protect, authorize('organizer', 'admin'), approveApplication);
router.patch('/:id/reject', protect, authorize('organizer', 'admin'), rejectApplication);

export default router;
