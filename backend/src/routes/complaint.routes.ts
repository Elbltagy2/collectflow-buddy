import { Router } from 'express';
import { complaintController } from '../controllers/complaint.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  createComplaintSchema,
  updateComplaintSchema,
  complaintIdSchema,
} from '../schemas/complaint.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create a new complaint (any authenticated user)
router.post('/', validateBody(createComplaintSchema), complaintController.create);

// Get my complaints
router.get('/mine', complaintController.findMine);

// Get complaint statistics (admin only)
router.get('/stats', authorize(UserRole.ADMIN), complaintController.getStats);

// Get all complaints (admin sees all, others see their own)
router.get('/', complaintController.findAll);

// Get a single complaint
router.get('/:id', validateParams(complaintIdSchema), complaintController.findById);

// Update complaint (admin only)
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(complaintIdSchema),
  validateBody(updateComplaintSchema),
  complaintController.update
);

export default router;
