import mongoose from "mongoose";
import PaymentVerification from "../models/PaymentVerification.js";
import CustomerPayment from "../models/CustomerPayment.js";
import EmployeeProfile from "../models/EmployeeProfile.js";
import CustomerProfile from "../models/CustomerProfile.js";

// Get all pending payments that need verification
export const getPendingPayments = async () => {
    const pendingPayments = await CustomerPayment.find({ 
        status: { $in: ['pending', 'processing'] } 
    })
    .populate('customer', 'fullName accountNumber email')
    .sort({ timestamp: 1 }); // Oldest first

    return pendingPayments;
};

// Get all payments (with optional filters)
export const getAllPaymentsForVerification = async (filters = {}) => {
    const query = {};
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.customerId) {
        // Use new ObjectId syntax
        query.customer = new mongoose.Types.ObjectId(filters.customerId);
    }

    const payments = await CustomerPayment.find(query)
        .populate('customer', 'fullName accountNumber email')
        .sort({ timestamp: -1 });

    return payments;
};

// Create verification record for a payment
export const createVerification = async ({ paymentId, employeeId, swiftCode, verificationNotes = '' }) => {
    // Verify payment exists
    const payment = await CustomerPayment.findById(paymentId);
    if (!payment) {
        throw new Error('Payment not found');
    }

    // Verify employee exists
    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) {
        throw new Error('Employee not found');
    }

    if (!employee.isActive) {
        throw new Error('Employee account is inactive');
    }

    // Check if verification already exists
    const existingVerification = await PaymentVerification.findOne({ payment: paymentId });
    if (existingVerification) {
        throw new Error('Payment already has a verification record');
    }

    // Create verification
    const verification = new PaymentVerification({
        payment: paymentId,
        employee: employeeId,
        swiftCode,
        verificationStatus: 'pending',
        verificationNotes,
        createdAt: new Date()
    });

    await verification.save();
    return verification;
};

// Verify a payment (mark as verified)
export const verifyPayment = async (verificationId, employeeId, verificationNotes = '') => {
    const verification = await PaymentVerification.findById(verificationId);
    
    if (!verification) {
        throw new Error('Verification record not found');
    }

    // Update verification status
    verification.verificationStatus = 'verified';
    verification.verificationNotes = verificationNotes;
    verification.verifiedAt = new Date();
    verification.employee = employeeId; // Track who verified it

    await verification.save();

    // Update payment status
    await CustomerPayment.findByIdAndUpdate(
        verification.payment,
        { status: 'processing' },
        { runValidators: true }
    );

    return verification;
};

// Reject a payment
export const rejectPayment = async (verificationId, employeeId, verificationNotes) => {
    const verification = await PaymentVerification.findById(verificationId);
    
    if (!verification) {
        throw new Error('Verification record not found');
    }

    if (!verificationNotes || verificationNotes.trim() === '') {
        throw new Error('Rejection notes are required');
    }

    verification.verificationStatus = 'rejected';
    verification.verificationNotes = verificationNotes;
    verification.verifiedAt = new Date();
    verification.employee = employeeId;

    await verification.save();

    // Update payment status
    await CustomerPayment.findByIdAndUpdate(
        verification.payment,
        { status: 'denied' },
        { runValidators: true }
    );

    return verification;
};

// Get all verifications with optional filters
export const getAllVerifications = async (filters = {}) => {
    const query = {};
    
    if (filters.status) {
        query.verificationStatus = filters.status;
    }
    
    if (filters.employeeId) {
        // Use new ObjectId syntax
        query.employee = new mongoose.Types.ObjectId(filters.employeeId);
    }

    const verifications = await PaymentVerification.find(query)
        .populate('payment')
        .populate('employee', 'fullName employeeId email')
        .sort({ createdAt: -1 });

    return verifications;
};

// Get verification by payment ID
export const getVerificationByPaymentId = async (paymentId) => {
    const verification = await PaymentVerification.findOne({ payment: paymentId })
        .populate('payment')
        .populate('employee', 'fullName employeeId email');
    
    return verification;
};

// Submit verified payments to SWIFT (batch submit)
export const submitToSwift = async (verificationIds, employeeId) => {
    if (!Array.isArray(verificationIds) || verificationIds.length === 0) {
        throw new Error('No verifications provided for SWIFT submission');
    }

    // Convert all IDs to ObjectId using new syntax
    const objectIds = verificationIds.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid verification ID: ${id}`);
        }
        return new mongoose.Types.ObjectId(id);
    });

    const verifications = await PaymentVerification.find({
        _id: { $in: objectIds },
        verificationStatus: 'verified'
    });

    if (verifications.length === 0) {
        throw new Error('No verified payments found for submission');
    }

    const updatedVerifications = [];
    const submissionTime = new Date();

    for (const verification of verifications) {
        // Update verification status
        verification.verificationStatus = 'submitted_to_swift';
        verification.submittedToSwiftAt = submissionTime;
        await verification.save();

        // Update payment status to completed
        await CustomerPayment.findByIdAndUpdate(
            verification.payment,
            { status: 'completed' },
            { runValidators: true }
        );

        updatedVerifications.push(verification);
    }

    return {
        message: `${updatedVerifications.length} payment(s) successfully submitted to SWIFT`,
        count: updatedVerifications.length,
        verifications: updatedVerifications,
        submittedAt: submissionTime
    };
};

// Get verified payments ready for SWIFT submission
export const getVerifiedPaymentsForSwift = async () => {
    const verifications = await PaymentVerification.find({
        verificationStatus: 'verified'
    })
    .populate({
        path: 'payment',
        populate: {
            path: 'customer',
            select: 'fullName accountNumber email'
        }
    })
    .populate('employee', 'fullName employeeId')
    .sort({ verifiedAt: 1 }); // Oldest verified first

    return verifications;
};