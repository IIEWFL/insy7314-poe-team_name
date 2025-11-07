import express from 'express'
import authRoutes from './authRoutes.js';
import customerPaymentRoutes from './customerPaymentRoutes.js';
import customerProfileRoutes from './customerProfileRoutes.js';
const router = express.Router();

//add a baseroute
router.use('/auth', authRoutes);
router.use('/customerPayments', customerPaymentRoutes);
router.use('/customerProfiles', customerProfileRoutes);

export default router