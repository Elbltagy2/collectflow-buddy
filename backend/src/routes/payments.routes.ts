import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { uploadReceipt } from '../middleware/upload';
import {
  createPaymentSchema,
  verifyPaymentSchema,
  paymentIdSchema,
} from '../schemas/payment.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all payments
router.get('/', paymentsController.findAll);

// Get pending verification (Accountant)
router.get(
  '/pending-verification',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  paymentsController.getPendingVerification
);

// Get single payment
router.get('/:id', validateParams(paymentIdSchema), paymentsController.findById);

// Create payment (Collector)
router.post(
  '/',
  authorize(UserRole.COLLECTOR),
  validateBody(createPaymentSchema),
  paymentsController.create
);

// Upload receipt image (Collector)
router.post(
  '/:id/receipt',
  authorize(UserRole.COLLECTOR),
  validateParams(paymentIdSchema),
  uploadReceipt.single('receipt'),
  paymentsController.uploadReceipt
);

// Verify payment (Accountant)
router.put(
  '/:id/verify',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  validateParams(paymentIdSchema),
  validateBody(verifyPaymentSchema),
  paymentsController.verify
);

export default router;
