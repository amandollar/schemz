import express from 'express';
import { generateScheme } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('organizer'));

router.post('/generate-scheme', generateScheme);

export default router;
