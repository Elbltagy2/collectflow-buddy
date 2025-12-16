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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all customers (filtered by role)
router.get('/', customersController.findAll);

// Get single customer
router.get('/:id', validateParams(customerIdSchema), customersController.findById);

// Admin and Sales Manager routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  validateBody(createCustomerSchema),
  customersController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  validateParams(customerIdSchema),
  validateBody(updateCustomerSchema),
  customersController.update
);

router.put(
  '/:id/assign',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  validateParams(customerIdSchema),
  validateBody(assignCollectorSchema),
  customersController.assignCollector
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(customerIdSchema),
  customersController.delete
);

export default router;
