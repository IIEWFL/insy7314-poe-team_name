import express from 'express';
import authController from '../controllers/authController.js';
import { validateSignup, validateLogin } from '../middleware/validator.js';
import bruteForce from '../middleware/bruteForceProtectionMiddleware.js';  

const router = express.Router();

// Signup with brute force protection
router.post('/signup', 
    bruteForce.prevent,           
    validateSignup, 
    authController.signup
);

// Login with brute force protection
router.post('/login', 
    bruteForce.prevent,           
    validateLogin, 
    authController.login
);

export default router;