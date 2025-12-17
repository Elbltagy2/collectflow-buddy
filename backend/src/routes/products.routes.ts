import { Router } from 'express';
import { productsController } from '../controllers/products.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createProductSchema, updateProductSchema, productIdSchema } from '../schemas/product.schema';
import { UserRole } from '@prisma/client';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all products (cached for 5 minutes)
router.get('/', cacheMiddleware({ ttlSeconds: 300 }), productsController.findAll);

// Get product categories (cached for 10 minutes)
router.get('/categories', cacheMiddleware({ ttlSeconds: 600 }), productsController.getCategories);

// Get single product (cached for 5 minutes)
router.get('/:id', cacheMiddleware({ ttlSeconds: 300 }), validateParams(productIdSchema), productsController.findById);

// Admin only routes - invalidate cache on mutations
router.post(
  '/',
  authorize(UserRole.ADMIN),
  invalidateCacheMiddleware(['product*']),
  validateBody(createProductSchema),
  productsController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  invalidateCacheMiddleware(['product*']),
  validateParams(productIdSchema),
  validateBody(updateProductSchema),
  productsController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  invalidateCacheMiddleware(['product*']),
  validateParams(productIdSchema),
  productsController.delete
);

export default router;
