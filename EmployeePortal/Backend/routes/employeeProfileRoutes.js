import express from 'express';
import employeeProfileController from '../controllers/employeeProfileController.js';
import employeeAuth, { requireAdmin } from '../middleware/employeeAuth.js';

const router = express.Router();

// All routes require employee authentication
router.use(employeeAuth);

// Get current employee's profile
router.get('/me', employeeProfileController.getMe);

// Admin-only routes
router.get('/', requireAdmin, employeeProfileController.getAllEmployees);
router.get('/:id', requireAdmin, employeeProfileController.getEmployeeById);
router.patch('/:id/deactivate', requireAdmin, employeeProfileController.deactivateEmployee);
router.patch('/:id/activate', requireAdmin, employeeProfileController.activateEmployee);

export default router;