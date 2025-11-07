import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const customerProfileSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    // Only letters, spaces, hyphens, and apostrophes (prevents injection attacks)
    match: [/^[a-zA-Z\s\-']+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'],
    validate: {
      validator: function(v) {
        // Block common injection patterns: <, >, {, }, [, ], $, ;, ', ", `, \
        return !/[<>{}[\]$;"`\\]/.test(v);
      },
      message: 'Full name contains invalid characters'
    }
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Strictly numeric only - prevents injection
    match: [/^\d{9}$/, 'ID number must be exactly 9 digits'],
    validate: {
      validator: function(v) {
        // Extra validation: only digits, no special characters
        return /^\d{9}$/.test(v) && !/[^0-9]/.test(v);
      },
      message: 'ID number must contain only digits'
    }
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Strictly numeric only - prevents injection
    match: [/^\d{12}$/, 'Account number must be exactly 12 digits'],
    validate: {
      validator: function(v) {
        // Extra validation: only digits, no special characters
        return /^\d{12}$/.test(v) && !/[^0-9]/.test(v);
      },
      message: 'Account number must contain only digits'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    // Allow alphanumeric and safe special chars only (!@#$%^&*()_+-=)
    match: [/^[a-zA-Z0-9!@#$%^&*()_+\-=]+$/, 'Password contains invalid characters'],
    validate: {
      validator: function(v) {
        // Block injection characters: <, >, {, }, [, ], ;, ', ", `, \, |
        return !/[<>{}[\];'"`\\|]/.test(v);
      },
      message: 'Password contains potentially dangerous characters'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [254, 'Email cannot exceed 254 characters'],
    // Strict email format - alphanumeric, dots, hyphens, underscores only
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please enter a valid email address'],
    validate: {
      validator: function(v) {
        // Block injection characters and ensure valid format
        return !/[<>{}[\]$;'"`\\|()!#%^&*+=,/?~]/.test(v) && 
               /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
      },
      message: 'Email contains invalid or potentially dangerous characters'
    }
  },
});

// Hash the password before saving
customerProfileSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(err) {
        next(err);
    }
});

// Login password comparison
customerProfileSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);
export default CustomerProfile;


// JavaScript regular expressions (no date) W3schools.com. Available at: https://www.w3schools.com/js/js_regexp.asp (Accessed: October 10, 2025).
// Regular expressions (no date) MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions (Accessed: October 10, 2025).

