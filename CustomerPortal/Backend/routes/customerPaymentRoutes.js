// routes/customerPaymentRoutes.js
import express from 'express';
import customerPaymentController from '../controllers/customerPaymentController.js';
import auth from '../middleware/auth.js';
import { validatePaymentCreate, validatePaymentStatus } from '../middleware/validator.js';

const router = express.Router();

router.post('/create', auth, validatePaymentCreate, customerPaymentController.create);
router.get('/all', customerPaymentController.getAll);
router.get('/my-payments', auth, customerPaymentController.getMyPayments);
router.get('/status/:status', customerPaymentController.getByStatus);
router.get('/:id', customerPaymentController.getById);
router.patch('/:id/status', auth, validatePaymentStatus, customerPaymentController.updateStatus);
router.put('/:id', auth, validatePaymentCreate, customerPaymentController.update);
router.delete('/:id', auth, customerPaymentController.remove);

export default router;