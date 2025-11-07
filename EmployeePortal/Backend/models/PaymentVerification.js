import mongoose from 'mongoose';

const paymentVerificationSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerPayment',
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid payment ID format'
    }
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid employee ID format'
    }
  },
  swiftCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code format'],
    validate: {
      validator: function(v) {
        return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v) && !/[^A-Z0-9]/.test(v);
      },
      message: 'SWIFT code contains invalid characters'
    }
  },
  verificationStatus: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: {
      values: ['pending', 'verified', 'rejected', 'submitted_to_swift'],
      message: '{VALUE} is not a valid verification status'
    },
    default: 'pending',
    match: [/^[a-z_]+$/, 'Status must contain only lowercase letters and underscores'],
    validate: {
      validator: function(v) {
        return /^[a-z_]+$/.test(v) && !/[^a-z_]/.test(v);
      },
      message: 'Status contains invalid characters'
    }
  },
  verificationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Verification notes cannot exceed 500 characters'],
    match: [/^[a-zA-Z0-9\s.,!?\-'()]+$/, 'Verification notes contain invalid characters'],
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return !/[<>{}[\]$;"`\\|@#%^&*+=~/]/.test(v);
      },
      message: 'Verification notes contain potentially dangerous characters'
    }
  },
  verifiedAt: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v instanceof Date && !isNaN(v) && v <= new Date();
      },
      message: 'Verified date must be valid and not in the future'
    }
  },
  submittedToSwiftAt: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v instanceof Date && !isNaN(v) && v <= new Date();
      },
      message: 'Submission date must be valid and not in the future'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
paymentVerificationSchema.index({ payment: 1, employee: 1 });
paymentVerificationSchema.index({ verificationStatus: 1 });
paymentVerificationSchema.index({ createdAt: -1 });

const PaymentVerification = mongoose.model('PaymentVerification', paymentVerificationSchema);

export default PaymentVerification;