import express from 'express';
import { 
  createScheme, 
  getOrganizerSchemes, 
  updateScheme, 
  submitScheme,
  deleteScheme
} from '../controllers/organizerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require organizer role
router.use(protect);
router.use(authorize('organizer'));

router.post('/scheme', createScheme);
router.get('/schemes', getOrganizerSchemes);
router.put('/scheme/:id', updateScheme);
router.post('/scheme/:id/submit', submitScheme);
router.delete('/scheme/:id', deleteScheme);

export default router;
