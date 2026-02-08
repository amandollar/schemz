import express from 'express';
import { 
  submitOrganizerApplication,
  getMyApplications,
  getApplicationStatus
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require user role
router.use(protect);
router.use(authorize('user'));

router.post('/organizer', submitOrganizerApplication);
router.get('/my-applications', getMyApplications);
router.get('/status', getApplicationStatus);

export default router;
