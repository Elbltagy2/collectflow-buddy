import { Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { CreatePaymentInput, VerifyPaymentInput } from '../schemas/payment.schema';
import { AuthenticatedRequest } from '../types';
import { UserRole, PaymentStatus } from '@prisma/client';
import { getFileUrl } from '../middleware/upload';

export class PaymentsController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      let collectorId = req.query.collectorId as string;
      const customerId = req.query.customerId as string;
      const status = req.query.status as PaymentStatus;
      const method = req.query.method as 'CASH' | 'FAWRY';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // If user is a collector, only show their payments
      if (req.user!.role === UserRole.COLLECTOR) {
        collectorId = req.user!.id;
      }

      const { payments, total } = await paymentsService.findAll({
        page,
        limit,
        collectorId,
        customerId,
        status,
        method,
        startDate,
        endDate,
      });

      sendPaginated(res, payments, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentsService.findById(id);

      // Collectors can only view their own payments
      if (req.user!.role === UserRole.COLLECTOR && payment.collectorId !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: 'You do not have access to this payment',
        });
        return;
      }

      sendSuccess(res, payment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreatePaymentInput = req.body;
      const collectorId = req.user!.id;
      const payment = await paymentsService.create(input, collectorId);

      sendCreated(res, payment, 'Payment recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verified, notes }: VerifyPaymentInput = req.body;
      const payment = await paymentsService.verify(id, verified, notes);

      sendSuccess(res, payment, verified ? 'Payment verified successfully' : 'Payment verification updated');
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
      const payment = await paymentsService.uploadReceipt(id, receiptUrl);

      sendSuccess(res, payment, 'Receipt uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPendingVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentsService.getPendingVerification();

      sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentsController = new PaymentsController();
