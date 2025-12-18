import { Response, NextFunction } from 'express';
import { routeOptimizationService } from '../services/route-optimization.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class RouteOptimizationController {
  async getOptimizedRoute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectorId = req.user!.id;
      const result = await routeOptimizationService.getOptimizedTodayRoute(collectorId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async optimizeCustomRoute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerIds } = req.body;
      const collectorId = req.user!.id;

      if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'customerIds array is required',
        });
        return;
      }

      const result = await routeOptimizationService.optimizeCollectorRoute(collectorId, customerIds);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const routeOptimizationController = new RouteOptimizationController();
