import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  updatePayment,
  deletePayment,
  getPaymentsByStatus
} from '../services/customerPaymentService.js';

// Create a new payment
const create = async (req, res) => {
  try {
    // Extract customer ID from JWT (decoded by auth middleware)
    const customerId = req.customerProfile.id || req.customerProfile._id;
    const { amount, currency, provider, recipientAccount } = req.body;

    // Validate required fields (customerId comes from token)
    if (!amount || !currency || !provider || !recipientAccount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate amount
    if (!/^\d+(\.\d{1,2})?$/.test(amount.toString()) || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number with up to 2 decimal places'
      });
    }

    // Validate currency (3-letter uppercase)
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({
        error: 'Currency must be a 3-letter uppercase code'
      });
    }

    // Validate provider (alphanumeric 2–50 chars)
    if (!/^[a-zA-Z0-9]{2,50}$/.test(provider)) {
      return res.status(400).json({
        error: 'Provider must be alphanumeric (2–50 characters)'
      });
    }

    // Validate recipientAccount (6–32 alphanumeric, hyphen, underscore)
    if (!/^[a-zA-Z0-9\-_]{6,32}$/.test(recipientAccount)) {
      return res.status(400).json({
        error:
          'Recipient account must be alphanumeric (6–32 chars, may include hyphens or underscores)'
      });
    }

    // Proceed to create payment
    const payment = await createPayment({
      customerId,
      amount,
      currency,
      provider,
      recipientAccount
    });

    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments (optionally filtered by ?customerId=)
const getAll = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (customerId && !/^[a-fA-F0-9]{24}$/.test(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }

    const payments = await getAllPayments(customerId);
    res.status(200).json({ count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single payment by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid payment ID format' });
    }

    const payment = await getPaymentById(id);
    res.status(200).json({ payment });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Update payment status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid payment ID format' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = [
      'pending',
      'processing',
      'completed',
      'denied',
      'failed',
      'reversed',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const payment = await updatePaymentStatus(id, status);
    res.status(200).json({ message: 'Payment status updated successfully', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update full payment
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid payment ID format' });
    }

    // Validation similar to create
    if (updateData.amount !== undefined) {
      if (!/^\d+(\.\d{1,2})?$/.test(updateData.amount.toString()) || updateData.amount <= 0) {
        return res.status(400).json({
          error: 'Amount must be a positive number with up to 2 decimal places'
        });
      }
    }

    if (updateData.currency && !/^[A-Z]{3}$/.test(updateData.currency)) {
      return res.status(400).json({ error: 'Currency must be a 3-letter uppercase code' });
    }

    if (updateData.provider && !/^[a-zA-Z0-9]{2,50}$/.test(updateData.provider)) {
      return res.status(400).json({
        error: 'Provider must be alphanumeric (2–50 characters)'
      });
    }

    if (updateData.recipientAccount && !/^[a-zA-Z0-9\-_]{6,32}$/.test(updateData.recipientAccount)) {
      return res.status(400).json({
        error:
          'Recipient account must be alphanumeric (6–32 chars, may include hyphens or underscores)'
      });
    }

    const payment = await updatePayment(id, updateData);
    res.status(200).json({ message: 'Payment updated successfully', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete payment
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid payment ID format' });
    }

    const payment = await deletePayment(id);
    res.status(200).json({ message: 'Payment deleted successfully', payment });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Get payments by status
const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { customerId } = req.query;

    const validStatuses = [
      'pending',
      'processing',
      'completed',
      'denied',
      'failed',
      'reversed',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (customerId && !/^[a-fA-F0-9]{24}$/.test(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }

    const payments = await getPaymentsByStatus(status, customerId);
    res.status(200).json({ count: payments.length, payments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments for authenticated customer
const getMyPayments = async (req, res) => {
  try {
    const customerId = req.customerProfile.id || req.customerProfile._id;

    if (!/^[a-fA-F0-9]{24}$/.test(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }

    const payments = await getAllPayments(customerId);
    res.status(200).json({ count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  create,
  getAll,
  getById,
  updateStatus,
  update,
  remove,
  getByStatus,
  getMyPayments
};
