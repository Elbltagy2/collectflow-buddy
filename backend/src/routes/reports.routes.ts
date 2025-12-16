import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats (all authenticated users)
router.get('/dashboard', reportsController.getDashboardStats);

// Collections report (Accountant, Sales Manager, Admin)
router.get(
  '/collections',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALES_MANAGER),
  reportsController.getCollectionsReport
);

// Outstanding balances report (Accountant, Sales Manager, Admin)
router.get(
  '/outstanding',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALES_MANAGER),
  reportsController.getOutstandingReport
);

// Collector performance report (Sales Manager, Admin)
router.get(
  '/performance',
  authorize(UserRole.ADMIN, UserRole.SALES_MANAGER),
  reportsController.getPerformanceReport
);

export default router;
