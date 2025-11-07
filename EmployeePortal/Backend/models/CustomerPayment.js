import mongoose from 'mongoose';

const customerPaymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerProfile',
    required: true,
    validate: {
      validator: function(v) {
        // Ensure it's a valid MongoDB ObjectId format
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid customer ID format'
    }
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0'],
    max: [999999999.99, 'Amount exceeds maximum allowed value'],
    validate: {
      validator: function(v) {
        // Ensure it's a positive number with max 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(v.toString()) && v > 0;
      },
      message: 'Amount must be a positive number with up to 2 decimal places'
    }
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    enum: {
      values: ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'INR'],
      message: '{VALUE} is not a supported currency'
    },
    // Strictly 3 uppercase letters only
    match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter code'],
    validate: {
      validator: function(v) {
        // Block any non-letter characters
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Currency code must contain only letters'
    }
  },
  provider: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Provider name must be at least 2 characters'],
    maxlength: [50, 'Provider name cannot exceed 50 characters'],
    // Alphanumeric only - no special characters for injection prevention
    match: [/^[a-zA-Z0-9]+$/, 'Provider name must be alphanumeric only'],
    validate: {
      validator: function(v) {
        // Extra validation: block injection characters
        return /^[a-zA-Z0-9]+$/.test(v) && !/[<>{}[\]$;'"`\\|()!@#%^&*+=,/?~\-_.\s]/.test(v);
      },
      message: 'Provider name contains invalid characters'
    }
  },
  recipientAccount: {
    type: String,
    required: true,
    trim: true,
    minlength: [6, 'Recipient account must be at least 6 characters'],
    maxlength: [32, 'Recipient account cannot exceed 32 characters'],
    // Alphanumeric with only hyphens and underscores allowed
    match: [/^[a-zA-Z0-9\-_]{6,32}$/, 'Recipient account must be alphanumeric and can include hyphens or underscores'],
    validate: {
      validator: function(v) {
        // Block injection characters: no <, >, {, }, [, ], $, ;, ', ", `, \, |, etc.
        return /^[a-zA-Z0-9\-_]{6,32}$/.test(v) && 
               !/[<>{}[\]$;'"`\\|()!@#%^&*+=,/?~.\s]/.test(v);
      },
      message: 'Recipient account contains invalid or potentially dangerous characters'
    }
  },
  status: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: {
      values: [
        'pending',
        'processing',
        'completed',
        'denied',
        'failed',
        'reversed',
        'cancelled',
      ],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending',
    // Only lowercase letters allowed
    match: [/^[a-z]+$/, 'Status must contain only lowercase letters'],
    validate: {
      validator: function(v) {
        // Extra validation: only lowercase letters, no special chars
        return /^[a-z]+$/.test(v) && !/[^a-z]/.test(v);
      },
      message: 'Status contains invalid characters'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        // Ensure it's a valid date and not in the future
        return v instanceof Date && !isNaN(v) && v <= new Date();
      },
      message: 'Timestamp must be a valid date and cannot be in the future'
    }
  },
});

// Index for faster queries
customerPaymentSchema.index({ customer: 1, status: 1 });
customerPaymentSchema.index({ timestamp: -1 });

const CustomerPayment = mongoose.model('CustomerPayment', customerPaymentSchema);

export default CustomerPayment;

// JavaScript regular expressions (no date) W3schools.com. Available at: https://www.w3schools.com/js/js_regexp.asp (Accessed: October 10, 2025).
// Regular expressions (no date) MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions (Accessed: October 10, 2025).
