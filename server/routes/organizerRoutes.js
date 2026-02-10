import express from 'express';
import { 
  createScheme, 
  getOrganizerSchemes, 
  updateScheme, 
  submitScheme,
  deleteScheme
} from '../controllers/organizerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All routes are protected and require organizer role
router.use(protect);
router.use(authorize('organizer'));

router.post('/scheme', createScheme);
router.get('/schemes', getOrganizerSchemes);
router.put('/scheme/:id', validateObjectId('id'), updateScheme);
router.post('/scheme/:id/submit', validateObjectId('id'), submitScheme);
router.delete('/scheme/:id', validateObjectId('id'), deleteScheme);

export default router;
