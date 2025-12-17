import { Router } from 'express';
import { customersController } from '../controllers/customers.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
  assignCollectorSchema,
} from '../schemas/customer.schema';
import { UserRole } from '@prisma/client';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all customers (cached for 2 minutes - shorter due to frequent updates)
router.get('/', cacheMiddleware({ ttlSeconds: 120 }), customersController.findAll);

// Get single customer (cached for 2 minutes)
router.get('/:id', cacheMiddleware({ ttlSeconds: 120 }), validateParams(customerIdSchema), customersController.findById);

// Admin and Sales Manager routes - invalidate cache on mutations
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  invalidateCacheMiddleware(['customer*', 'route:*']),
  validateBody(createCustomerSchema),
  customersController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  invalidateCacheMiddleware(['customer*']),
  validateParams(customerIdSchema),
  validateBody(updateCustomerSchema),
  customersController.update
);

router.put(
  '/:id/assign',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  invalidateCacheMiddleware(['customer*', 'route:*']),
  validateParams(customerIdSchema),
  validateBody(assignCollectorSchema),
  customersController.assignCollector
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  invalidateCacheMiddleware(['customer*', 'route:*', 'invoice*']),
  validateParams(customerIdSchema),
  customersController.delete
);

export default router;
