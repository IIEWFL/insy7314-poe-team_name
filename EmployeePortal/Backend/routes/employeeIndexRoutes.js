import express from 'express';
import employeeAuthRoutes from './employeeAuthRoutes.js';
import paymentVerificationRoutes from './paymentVerificationRoutes.js';
import employeeProfileRoutes from './employeeProfileRoutes.js';

const router = express.Router();

// Employee portal base routes
router.use('/auth', employeeAuthRoutes);
router.use('/verifications', paymentVerificationRoutes);
router.use('/employees', employeeProfileRoutes);

export default router;