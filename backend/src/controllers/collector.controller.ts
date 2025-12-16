import { Response, NextFunction } from 'express';
import { collectorService } from '../services/collector.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CollectorController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectorId = req.user!.id;
      const stats = await collectorService.getStats(collectorId);

      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getDailyRoute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectorId = req.user!.id;
      const route = await collectorService.getDailyRoute(collectorId);

      sendSuccess(res, route);
    } catch (error) {
      next(error);
    }
  }

  async markVisited(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectorId = req.user!.id;
      const { customerId } = req.params;
      const { visited } = req.body;

      await collectorService.markCustomerVisited(collectorId, customerId, visited !== false);

      sendSuccess(res, null, 'Customer visit status updated');
    } catch (error) {
      next(error);
    }
  }

  async getWalletBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectorId = req.user!.id;
      const balance = await collectorService.getWalletBalance(collectorId);

      sendSuccess(res, { balance });
    } catch (error) {
      next(error);
    }
  }
}

export const collectorController = new CollectorController();
