import express from 'express';
import employeeAuthController from '../controllers/employeeAuthController.js';
import { validateEmployeeRegistration, validateEmployeeLogin } from '../middleware/employeeValidator.js';
import bruteForce from '../middleware/bruteForceProtectionMiddleware.js';
import employeeAuth, { requireAdmin } from '../middleware/employeeAuth.js';

const router = express.Router();

// Employee registration (admin only for pre-registering employees)
router.post('/register', 
    employeeAuth,
    requireAdmin,
    bruteForce.prevent,
    validateEmployeeRegistration, 
    employeeAuthController.register
);

// Employee login
router.post('/login', 
    bruteForce.prevent,
    validateEmployeeLogin, 
    employeeAuthController.login
);

export default router;