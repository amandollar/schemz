import express from 'express';
import multer from 'multer';
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  uploadProfileImage,
  verifyEmail,
  resendVerification
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

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

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.post('/upload-profile-image', protect, upload.single('image'), uploadProfileImage);
router.put('/profile', protect, updateProfile);

export default router;
