import { Router } from 'express';
import { collectorController } from '../controllers/collector.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication as collector
router.use(authenticate);
router.use(authorize(UserRole.COLLECTOR));

// Get collector stats
router.get('/stats', collectorController.getStats);

// Get today's route
router.get('/route', collectorController.getDailyRoute);

// Mark customer as visited
router.put('/route/:customerId/visited', collectorController.markVisited);

// Get wallet balance
router.get('/wallet', collectorController.getWalletBalance);

export default router;
