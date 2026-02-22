import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  createQuery,
  getQueries,
  getQueryById,
  sendMessage,
  resolveQuery
} from '../controllers/supportQueryController.js';

const router = express.Router();

// All routes require user, organizer, or admin (citizens can also chat with admin)
router.use(protect, authorize('user', 'organizer', 'admin'));

router.post('/', createQuery);
router.get('/', getQueries);
router.get('/:id', validateObjectId('id'), getQueryById);
router.post('/:id/messages', validateObjectId('id'), sendMessage);

// Resolve - admin only
router.patch('/:id/resolve', authorize('admin'), validateObjectId('id'), resolveQuery);

export default router;
