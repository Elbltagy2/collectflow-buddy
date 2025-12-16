import { Response, NextFunction } from 'express';
import { reportsService } from '../services/reports.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ReportsController {
  async getCollectionsReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
      const collectorId = req.query.collectorId as string;

      const report = await reportsService.getCollectionsReport({
        startDate,
        endDate,
        collectorId,
      });

      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getOutstandingReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const collectorId = req.query.collectorId as string;

      const report = await reportsService.getOutstandingReport({
        collectorId,
      });

      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getPerformanceReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const report = await reportsService.getPerformanceReport({
        startDate,
        endDate,
      });

      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await reportsService.getDashboardStats();

      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
