import { Router } from 'express';
import { productsController } from '../controllers/products.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createProductSchema, updateProductSchema, productIdSchema } from '../schemas/product.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all products (accessible by all authenticated users)
router.get('/', productsController.findAll);

// Get product categories
router.get('/categories', productsController.getCategories);

// Get single product
router.get('/:id', validateParams(productIdSchema), productsController.findById);

// Admin only routes
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validateBody(createProductSchema),
  productsController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(productIdSchema),
  validateBody(updateProductSchema),
  productsController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(productIdSchema),
  productsController.delete
);

export default router;
