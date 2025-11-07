import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const employeeProfileSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s\-']+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'],
    validate: {
      validator: function(v) {
        return !/[<>{}[\]$;"`\\]/.test(v);
      },
      message: 'Full name contains invalid characters'
    }
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^EMP\d{6}$/, 'Employee ID must be in format EMP followed by 6 digits'],
    validate: {
      validator: function(v) {
        return /^EMP\d{6}$/.test(v) && !/[^A-Z0-9]/.test(v);
      },
      message: 'Employee ID must contain only letters and digits'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    match: [/^[a-zA-Z0-9!@#$%^&*()_+\-=]+$/, 'Password contains invalid characters'],
    validate: {
      validator: function(v) {
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
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please enter a valid email address'],
    validate: {
      validator: function(v) {
        return !/[<>{}[\]$;'"`\\|()!#%^&*+=,/?~]/.test(v) && 
               /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
      },
      message: 'Email contains invalid or potentially dangerous characters'
    }
  },
  department: {
    type: String,
    required: true,
    trim: true,
    enum: {
      values: ['Payments', 'Verification', 'Compliance', 'Administration', 'Management'],
      message: '{VALUE} is not a valid department'
    }
  },
  role: {
    type: String,
    required: true,
    trim: true,
    enum: {
      values: ['verifier', 'admin', 'manager'],
      message: '{VALUE} is not a valid role'
    },
    default: 'verifier'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving
employeeProfileSchema.pre('save', async function (next) {
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
employeeProfileSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);
export default EmployeeProfile;