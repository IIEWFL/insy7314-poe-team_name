import { body, param, validationResult } from 'express-validator';

// Helper function to handle validation results
export const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth route validators
export const validateSignup = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Invalid full name format'),
  body('idNumber')
    .trim()
    .matches(/^\d{9}$/)
    .withMessage('ID number must be exactly 9 digits'),
  body('accountNumber')
    .trim()
    .matches(/^\d{12}$/)
    .withMessage('Account number must be exactly 12 digits'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=]+$/)
    .withMessage('Invalid password format'),
  body('email')
    .trim()
    .isEmail()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
    .withMessage('Invalid email format'),
  validateResults
];

export const validateLogin = [
  body('accountNumber')
    .trim()
    .matches(/^\d{12}$/)
    .withMessage('Account number must be exactly 12 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateResults
];

// Customer Payment validators
export const validatePaymentCreate = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('Invalid amount'),
  body('currency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .isIn(['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'INR'])
    .withMessage('Invalid currency'),
  body('provider')
    .trim()
    .matches(/^[a-zA-Z0-9]+$/)
    .isLength({ min: 2, max: 50 })
    .withMessage('Invalid provider format'),
  body('recipientAccount')
    .trim()
    .matches(/^[a-zA-Z0-9\-_]{6,32}$/)
    .withMessage('Invalid recipient account format'),
  validateResults
];

export const validatePaymentStatus = [
  param('id').isMongoId().withMessage('Invalid payment ID'),
  body('status')
    .isIn(['pending', 'processing', 'completed', 'denied', 'failed', 'reversed', 'cancelled'])
    .withMessage('Invalid status'),
  validateResults
];

// Customer Profile validators
export const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Invalid full name format'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
    .withMessage('Invalid email format'),
  validateResults
];
