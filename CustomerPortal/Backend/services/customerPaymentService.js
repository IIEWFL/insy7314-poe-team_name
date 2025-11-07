import CustomerPayment from "../models/CustomerPayment.js";
import CustomerProfile from "../models/CustomerProfile.js";

// Create a new payment
export const createPayment = async ({ customerId, amount, currency, provider, recipientAccount }) => {
    // Verify customer exists
    const customer = await CustomerProfile.findById(customerId);
    if (!customer) {
        throw new Error('Customer not found');
    }

    // Create new payment
    const payment = new CustomerPayment({
        customer: customerId,
        amount,
        currency,
        provider,
        recipientAccount,
        status: 'pending'
    });

    await payment.save();
    return payment;
};

// Get all payments (optionally filtered by customer)
export const getAllPayments = async (customerId = null) => {
    const filter = customerId ? { customer: customerId } : {};
    const payments = await CustomerPayment.find(filter)
        .populate('customer', 'fullName accountNumber email')
        .sort({ timestamp: -1 });
    return payments;
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
    const payment = await CustomerPayment.findById(paymentId)
        .populate('customer', 'fullName accountNumber email');
    
    if (!payment) {
        throw new Error('Payment not found');
    }
    
    return payment;
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status) => {
    const validStatuses = ['pending', 'processing', 'completed', 'denied', 'failed', 'reversed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const payment = await CustomerPayment.findByIdAndUpdate(
        paymentId,
        { status },
        { new: true, runValidators: true }
    ).populate('customer', 'fullName accountNumber email');

    if (!payment) {
        throw new Error('Payment not found');
    }

    return payment;
};

// Update entire payment
export const updatePayment = async (paymentId, updateData) => {
    const payment = await CustomerPayment.findByIdAndUpdate(
        paymentId,
        updateData,
        { new: true, runValidators: true }
    ).populate('customer', 'fullName accountNumber email');

    if (!payment) {
        throw new Error('Payment not found');
    }

    return payment;
};

// Delete payment
export const deletePayment = async (paymentId) => {
    const payment = await CustomerPayment.findByIdAndDelete(paymentId);
    
    if (!payment) {
        throw new Error('Payment not found');
    }
    
    return payment;
};

// Get payments by status
export const getPaymentsByStatus = async (status, customerId = null) => {
    const filter = { status };
    if (customerId) {
        filter.customer = customerId;
    }

    const payments = await CustomerPayment.find(filter)
        .populate('customer', 'fullName accountNumber email')
        .sort({ timestamp: -1 });
    
    return payments;
};