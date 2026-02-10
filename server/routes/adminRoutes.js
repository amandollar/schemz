import express from 'express';
import { 
  getPendingSchemes, 
  getAllSchemesAdmin, 
  approveScheme, 
  rejectScheme,
  toggleSchemeStatus,
  getPendingApplications,
  getAllApplications,
  approveApplication,
  rejectApplication
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Scheme management routes
router.get('/schemes/pending', getPendingSchemes);
router.get('/schemes', getAllSchemesAdmin);
router.post('/scheme/:id/approve', validateObjectId('id'), approveScheme);
router.post('/scheme/:id/reject', validateObjectId('id'), rejectScheme);
router.put('/scheme/:id/toggle', validateObjectId('id'), toggleSchemeStatus);

// Organizer application management routes
router.get('/applications/pending', getPendingApplications);
router.get('/applications', getAllApplications);
router.post('/application/:id/approve', validateObjectId('id'), approveApplication);
router.post('/application/:id/reject', validateObjectId('id'), rejectApplication);

export default router;
