import { Response, NextFunction } from 'express';
import { customersService } from '../services/customers.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { CreateCustomerInput, UpdateCustomerInput, AssignCollectorInput } from '../schemas/customer.schema';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '@prisma/client';

export class CustomersController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sortBy = (req.query.sortBy as string) || 'name';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
      const search = req.query.search as string;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      let collectorId = req.query.collectorId as string;

      // If user is a collector, only show their customers
      if (req.user!.role === UserRole.COLLECTOR) {
        collectorId = req.user!.id;
      }

      const { customers, total } = await customersService.findAll(
        { page, limit, sortBy, sortOrder },
        { collectorId, isActive, search }
      );

      sendPaginated(res, customers, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customersService.findById(id);

      // If user is a collector, verify they own this customer
      if (req.user!.role === UserRole.COLLECTOR && customer.collectorId !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: 'You do not have access to this customer',
        });
        return;
      }

      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateCustomerInput = req.body;
      const customer = await customersService.create(input);

      sendCreated(res, customer, 'Customer created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateCustomerInput = req.body;
      const customer = await customersService.update(id, input);

      sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignCollector(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { collectorId }: AssignCollectorInput = req.body;
      const customer = await customersService.assignCollector(id, collectorId);

      sendSuccess(res, customer, 'Customer assigned to collector successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await customersService.delete(id);

      sendSuccess(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const customersController = new CustomersController();
