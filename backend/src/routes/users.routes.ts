import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createUserSchema, updateUserSchema, userIdSchema } from '../schemas/user.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all collectors (accessible by managers and admins)
router.get(
  '/collectors',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.ACCOUNTANT),
  usersController.getCollectors
);

// Admin only routes
router.get('/', authorize(UserRole.ADMIN), usersController.findAll);

router.get(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(userIdSchema),
  usersController.findById
);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validateBody(createUserSchema),
  usersController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  usersController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(userIdSchema),
  usersController.delete
);

export default router;
