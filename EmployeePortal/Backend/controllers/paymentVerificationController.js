import {
    getPendingPayments,
    getAllPaymentsForVerification,
    createVerification,
    verifyPayment,
    rejectPayment,
    getAllVerifications,
    getVerificationByPaymentId,
    submitToSwift,
    getVerifiedPaymentsForSwift
} from '../services/paymentVerificationService.js';

// Get all pending payments that need verification
const getPending = async (req, res) => {
    try {
        const payments = await getPendingPayments();
        res.status(200).json({ count: payments.length, payments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all payments with optional filters
const getAllPayments = async (req, res) => {
    try {
        const { status, customerId } = req.query;
        
        if (customerId && !/^[a-fA-F0-9]{24}$/.test(customerId)) {
            return res.status(400).json({ error: 'Invalid customer ID format' });
        }

        const filters = {};
        if (status) filters.status = status;
        if (customerId) filters.customerId = customerId;

        const payments = await getAllPaymentsForVerification(filters);
        res.status(200).json({ count: payments.length, payments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create verification record for a payment
const create = async (req, res) => {
    try {
        const employeeId = req.employeeProfile.id || req.employeeProfile._id;
        const { paymentId, swiftCode, verificationNotes } = req.body;

        if (!paymentId || !swiftCode) {
            return res.status(400).json({ error: 'Payment ID and SWIFT code are required' });
        }

        // Validate payment ID format
        if (!/^[a-fA-F0-9]{24}$/.test(paymentId)) {
            return res.status(400).json({ error: 'Invalid payment ID format' });
        }

        // Validate SWIFT code format
        if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid SWIFT code format (must be 8 or 11 characters)' });
        }

        const verification = await createVerification({
            paymentId,
            employeeId,
            swiftCode: swiftCode.toUpperCase(),
            verificationNotes
        });

        res.status(201).json({ 
            message: 'Verification record created successfully', 
            verification 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Verify a payment
const verify = async (req, res) => {
    try {
        const employeeId = req.employeeProfile.id || req.employeeProfile._id;
        const { id } = req.params;
        const { verificationNotes } = req.body;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid verification ID format' });
        }

        const verification = await verifyPayment(id, employeeId, verificationNotes);
        res.status(200).json({ 
            message: 'Payment verified successfully', 
            verification 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Reject a payment
const reject = async (req, res) => {
    try {
        const employeeId = req.employeeProfile.id || req.employeeProfile._id;
        const { id } = req.params;
        const { verificationNotes } = req.body;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid verification ID format' });
        }

        if (!verificationNotes || verificationNotes.trim() === '') {
            return res.status(400).json({ error: 'Rejection notes are required' });
        }

        const verification = await rejectPayment(id, employeeId, verificationNotes);
        res.status(200).json({ 
            message: 'Payment rejected successfully', 
            verification 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all verifications with optional filters
const getAll = async (req, res) => {
    try {
        const { status, employeeId } = req.query;

        if (employeeId && !/^[a-fA-F0-9]{24}$/.test(employeeId)) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }

        const filters = {};
        if (status) filters.status = status;
        if (employeeId) filters.employeeId = employeeId;

        const verifications = await getAllVerifications(filters);
        res.status(200).json({ count: verifications.length, verifications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get verification by payment ID
const getByPaymentId = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(paymentId)) {
            return res.status(400).json({ error: 'Invalid payment ID format' });
        }

        const verification = await getVerificationByPaymentId(paymentId);
        
        if (!verification) {
            return res.status(404).json({ error: 'Verification record not found for this payment' });
        }

        res.status(200).json({ verification });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get verified payments ready for SWIFT submission
const getVerifiedForSwift = async (req, res) => {
    try {
        const verifications = await getVerifiedPaymentsForSwift();
        res.status(200).json({ 
            count: verifications.length, 
            verifications 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Submit verified payments to SWIFT
const submitSwift = async (req, res) => {
    try {
        const employeeId = req.employeeProfile.id || req.employeeProfile._id;
        const { verificationIds } = req.body;

        if (!verificationIds || !Array.isArray(verificationIds) || verificationIds.length === 0) {
            return res.status(400).json({ error: 'Verification IDs array is required' });
        }

        // Validate all verification IDs
        for (const id of verificationIds) {
            if (!/^[a-fA-F0-9]{24}$/.test(id)) {
                return res.status(400).json({ error: `Invalid verification ID format: ${id}` });
            }
        }

        const result = await submitToSwift(verificationIds, employeeId);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    getPending,
    getAllPayments,
    create,
    verify,
    reject,
    getAll,
    getByPaymentId,
    getVerifiedForSwift,
    submitSwift
};