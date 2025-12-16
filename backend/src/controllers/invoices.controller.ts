import { Response, NextFunction } from 'express';
import { invoicesService } from '../services/invoices.service';
import { excelService } from '../services/excel.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice.schema';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '@prisma/client';

export class InvoicesController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const customerId = req.query.customerId as string;
      const status = req.query.status as 'PAID' | 'PARTIAL' | 'UNPAID';
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const { invoices, total } = await invoicesService.findAll({
        page,
        limit,
        customerId,
        status,
        startDate,
        endDate,
      });

      sendPaginated(res, invoices, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoicesService.findById(id);

      sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  async findByCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params;
      const invoices = await invoicesService.findByCustomer(customerId);

      sendSuccess(res, invoices);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateInvoiceInput = req.body;
      const createdById = req.user!.id;
      const invoice = await invoicesService.create(input, createdById);

      sendCreated(res, invoice, 'Invoice created successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadExcel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const filePath = req.file.path;
      const result = await excelService.parseInvoiceFile(filePath);

      // Return parsed data for user review
      sendSuccess(res, {
        rows: result.rows,
        summary: {
          total: result.rows.length,
          valid: result.validCount,
          errors: result.errorCount,
          totalAmount: result.totalAmount,
        },
        filePath, // Include for subsequent create call
      });
    } catch (error) {
      next(error);
    }
  }

  async createFromExcel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rows, dueDate } = req.body;

      if (!rows || !Array.isArray(rows)) {
        res.status(400).json({
          success: false,
          error: 'Invalid rows data',
        });
        return;
      }

      const result = await excelService.createInvoicesFromParsed(
        rows,
        req.user!.id,
        new Date(dueDate)
      );

      sendCreated(res, result, `${result.created} invoices created successfully`);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateInvoiceInput = req.body;
      const invoice = await invoicesService.update(id, input);

      sendSuccess(res, invoice, 'Invoice updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await invoicesService.delete(id);

      sendSuccess(res, null, 'Invoice deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOutstanding(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let collectorId = req.query.collectorId as string;

      // If user is a collector, only show their outstanding
      if (req.user!.role === UserRole.COLLECTOR) {
        collectorId = req.user!.id;
      }

      const invoices = await invoicesService.getOutstandingInvoices(collectorId);

      sendSuccess(res, invoices);
    } catch (error) {
      next(error);
    }
  }
}

export const invoicesController = new InvoicesController();
