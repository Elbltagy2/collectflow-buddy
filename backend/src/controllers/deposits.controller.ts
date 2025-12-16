import { Response, NextFunction } from 'express';
import { depositsService } from '../services/deposits.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { CreateDepositInput, VerifyDepositInput } from '../schemas/deposit.schema';
import { AuthenticatedRequest } from '../types';
import { UserRole, DepositStatus } from '@prisma/client';
import { getFileUrl } from '../middleware/upload';

export class DepositsController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      let collectorId = req.query.collectorId as string;
      const status = req.query.status as DepositStatus;
      const method = req.query.method as 'CASH' | 'FAWRY';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // If user is a collector, only show their deposits
      if (req.user!.role === UserRole.COLLECTOR) {
        collectorId = req.user!.id;
      }

      const { deposits, total } = await depositsService.findAll({
        page,
        limit,
        collectorId,
        status,
        method,
        startDate,
        endDate,
      });

      sendPaginated(res, deposits, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deposit = await depositsService.findById(id);

      // Collectors can only view their own deposits
      if (req.user!.role === UserRole.COLLECTOR && deposit.collectorId !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: 'You do not have access to this deposit',
        });
        return;
      }

      sendSuccess(res, deposit);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateDepositInput = req.body;
      const collectorId = req.user!.id;
      const deposit = await depositsService.create(input, collectorId);

      sendCreated(res, deposit, 'Deposit submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verified, notes }: VerifyDepositInput = req.body;
      const deposit = await depositsService.verify(id, verified, notes);

      sendSuccess(res, deposit, verified ? 'Deposit verified successfully' : 'Deposit verification updated');
    } catch (error) {
      next(error);
    }
  }

  async uploadReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const receiptUrl = getFileUrl(req.file.filename, 'receipts');
      const deposit = await depositsService.uploadReceipt(id, receiptUrl);

      sendSuccess(res, deposit, 'Receipt uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWalletBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectorId = req.user!.id;
      const balance = await depositsService.getCollectorWalletBalance(collectorId);

      sendSuccess(res, { balance });
    } catch (error) {
      next(error);
    }
  }

  async getPendingDeposits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deposits = await depositsService.getPendingDeposits();

      sendSuccess(res, deposits);
    } catch (error) {
      next(error);
    }
  }
}

export const depositsController = new DepositsController();
