// routes/customerProfileRoutes.js
import express from 'express';
import CustomerProfile from '../models/CustomerProfile.js';
import customerProfileController from '../controllers/customerProfileController.js';
import auth from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validator.js';

const router = express.Router();

router.use(auth);
router.get('/me', customerProfileController.getME);
router.get('/', customerProfileController.getAllCustomerProfiles);
router.get('/:id', customerProfileController.getCustomerProfileById);
router.delete('/:id', customerProfileController.deleteCustomerProfileById);

export default router;