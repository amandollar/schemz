import express from 'express';
import { 
  getEligibleSchemes, 
  getAllSchemes, 
  getScheme 
} from '../controllers/schemeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getAllSchemes);
router.get('/match', protect, authorize('user'), getEligibleSchemes);
router.get('/:id', validateObjectId('id'), getScheme);

export default router;
