import { Router } from 'express';
import { collectorController } from '../controllers/collector.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();

// All routes require authentication as collector
router.use(authenticate);
router.use(authorize(UserRole.COLLECTOR));

// Get collector stats (cached for 30 seconds)
router.get('/stats', cacheMiddleware({ ttlSeconds: 30 }), collectorController.getStats);

// Get today's route (cached for 1 minute)
router.get('/route', cacheMiddleware({ ttlSeconds: 60 }), collectorController.getDailyRoute);

// Mark customer as visited - invalidates route cache
router.put('/route/:customerId/visited', invalidateCacheMiddleware(['route:*', 'stats:*']), collectorController.markVisited);

// Get wallet balance (cached for 30 seconds)
router.get('/wallet', cacheMiddleware({ ttlSeconds: 30 }), collectorController.getWalletBalance);

export default router;
