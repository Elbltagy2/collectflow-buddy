import { Router } from 'express';
import { depositsController } from '../controllers/deposits.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { uploadReceipt } from '../middleware/upload';
import {
  createDepositSchema,
  verifyDepositSchema,
  depositIdSchema,
} from '../schemas/deposit.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all deposits
router.get('/', depositsController.findAll);

// Get pending deposits (Accountant)
router.get(
  '/pending',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  depositsController.getPendingDeposits
);

// Get wallet balance (Collector)
router.get(
  '/wallet-balance',
  authorize(UserRole.COLLECTOR),
  depositsController.getWalletBalance
);

// Get single deposit
router.get('/:id', validateParams(depositIdSchema), depositsController.findById);

// Create deposit (Collector)
router.post(
  '/',
  authorize(UserRole.COLLECTOR),
  validateBody(createDepositSchema),
  depositsController.create
);

// Upload receipt image (Collector)
router.post(
  '/:id/receipt',
  authorize(UserRole.COLLECTOR),
  validateParams(depositIdSchema),
  uploadReceipt.single('receipt'),
  depositsController.uploadReceipt
);

// Verify deposit (Accountant)
router.put(
  '/:id/verify',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  validateParams(depositIdSchema),
  validateBody(verifyDepositSchema),
  depositsController.verify
);

export default router;
