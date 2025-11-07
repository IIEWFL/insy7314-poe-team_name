import { body, param, validationResult } from 'express-validator';

// Helper function to handle validation results
export const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Employee registration validator
export const validateEmployeeRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Invalid full name format'),
  body('employeeId')
    .trim()
    .matches(/^EMP\d{6}$/)
    .withMessage('Employee ID must be in format EMP followed by 6 digits'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=]+$/)
    .withMessage('Invalid password format'),
  body('email')
    .trim()
    .isEmail()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
    .withMessage('Invalid email format'),
  body('department')
    .trim()
    .isIn(['Payments', 'Verification', 'Compliance', 'Administration', 'Management'])
    .withMessage('Invalid department'),
  body('role')
    .optional()
    .trim()
    .isIn(['verifier', 'admin', 'manager'])
    .withMessage('Invalid role'),
  validateResults
];

// Employee login validator
export const validateEmployeeLogin = [
  body('employeeId')
    .trim()
    .matches(/^EMP\d{6}$/)
    .withMessage('Employee ID must be in format EMP followed by 6 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateResults
];

// Create verification validator
export const validateCreateVerification = [
  body('paymentId')
    .isMongoId()
    .withMessage('Invalid payment ID'),
  body('swiftCode')
    .trim()
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i)
    .withMessage('Invalid SWIFT code format (must be 8 or 11 characters)'),
  body('verificationNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .matches(/^[a-zA-Z0-9\s.,!?\-'()]*$/)
    .withMessage('Verification notes contain invalid characters'),
  validateResults
];

// Verify payment validator
export const validateVerifyPayment = [
  param('id').isMongoId().withMessage('Invalid verification ID'),
  body('verificationNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .matches(/^[a-zA-Z0-9\s.,!?\-'()]*$/)
    .withMessage('Verification notes contain invalid characters'),
  validateResults
];

// Reject payment validator
export const validateRejectPayment = [
  param('id').isMongoId().withMessage('Invalid verification ID'),
  body('verificationNotes')
    .notEmpty()
    .withMessage('Rejection notes are required')
    .trim()
    .isLength({ max: 500 })
    .matches(/^[a-zA-Z0-9\s.,!?\-'()]+$/)
    .withMessage('Verification notes contain invalid characters'),
  validateResults
];

// Submit to SWIFT validator
export const validateSubmitSwift = [
  body('verificationIds')
    .isArray({ min: 1 })
    .withMessage('Verification IDs array is required and must not be empty'),
  body('verificationIds.*')
    .isMongoId()
    .withMessage('Each verification ID must be valid'),
  validateResults
];