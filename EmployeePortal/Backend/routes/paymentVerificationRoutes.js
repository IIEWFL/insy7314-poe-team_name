import express from 'express';
import paymentVerificationController from '../controllers/paymentVerificationController.js';
import employeeAuth from '../middleware/employeeAuth.js';
import {
    validateCreateVerification,
    validateVerifyPayment,
    validateRejectPayment,
    validateSubmitSwift
} from '../middleware/employeeValidator.js';

// IMPORT THE FUCKING CUSTOMERPROFILE MODEL HERE
import '../models/CustomerProfile.js';

const router = express.Router();

// All routes require employee authentication
router.use(employeeAuth);

// Get all pending payments that need verification
router.get('/pending-payments', paymentVerificationController.getPending);

// Get all payments with optional filters
router.get('/payments', paymentVerificationController.getAllPayments);

// Get all verifications with optional filters
router.get('/all', paymentVerificationController.getAll);

// Get verification by payment ID
router.get('/payment/:paymentId', paymentVerificationController.getByPaymentId);

// Get verified payments ready for SWIFT submission
router.get('/verified-for-swift', paymentVerificationController.getVerifiedForSwift);

// Create verification record for a payment
router.post('/create', validateCreateVerification, paymentVerificationController.create);

// Verify a payment (mark as verified)
router.patch('/:id/verify', validateVerifyPayment, paymentVerificationController.verify);

// Reject a payment
router.patch('/:id/reject', validateRejectPayment, paymentVerificationController.reject);

// Submit verified payments to SWIFT
router.post('/submit-to-swift', validateSubmitSwift, paymentVerificationController.submitSwift);

export default router;