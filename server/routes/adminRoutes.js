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

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Scheme management routes
router.get('/schemes/pending', getPendingSchemes);
router.get('/schemes', getAllSchemesAdmin);
router.post('/scheme/:id/approve', approveScheme);
router.post('/scheme/:id/reject', rejectScheme);
router.put('/scheme/:id/toggle', toggleSchemeStatus);

// Organizer application management routes
router.get('/applications/pending', getPendingApplications);
router.get('/applications', getAllApplications);
router.post('/application/:id/approve', approveApplication);
router.post('/application/:id/reject', rejectApplication);

export default router;
