import { Router } from 'express';
import { routeOptimizationController } from '../controllers/route-optimization.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Get optimized route for today (for collectors)
router.get(
  '/today',
  authorize(UserRole.COLLECTOR),
  routeOptimizationController.getOptimizedRoute
);

// Optimize a custom set of customers
router.post(
  '/optimize',
  authorize(UserRole.COLLECTOR, UserRole.ADMIN, UserRole.SALES_MANAGER),
  routeOptimizationController.optimizeCustomRoute
);

export default router;
