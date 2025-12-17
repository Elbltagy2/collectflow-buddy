import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats (cached for 1 minute - needs to be fresh)
router.get('/dashboard', cacheMiddleware({ ttlSeconds: 60 }), reportsController.getDashboardStats);

// Collections report (cached for 2 minutes)
router.get(
  '/collections',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALES_MANAGER),
  cacheMiddleware({ ttlSeconds: 120 }),
  reportsController.getCollectionsReport
);

// Outstanding balances report (cached for 2 minutes)
router.get(
  '/outstanding',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALES_MANAGER),
  cacheMiddleware({ ttlSeconds: 120 }),
  reportsController.getOutstandingReport
);

// Collector performance report (cached for 5 minutes)
router.get(
  '/performance',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  cacheMiddleware({ ttlSeconds: 300 }),
  reportsController.getPerformanceReport
);

export default router;
