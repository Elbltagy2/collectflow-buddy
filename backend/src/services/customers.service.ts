import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateCustomerInput, UpdateCustomerInput } from '../schemas/customer.schema';
import { PaginationParams } from '../types';
import { Customer, UserRole } from '@prisma/client';

interface CustomerFilters {
  collectorId?: string;
  isActive?: boolean;
  search?: string;
}

export class CustomersService {
  async findAll(
    params: PaginationParams = {},
    filters: CustomerFilters = {}
  ): Promise<{ customers: Customer[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.collectorId) {
      where.collectorId = filters.collectorId;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          collector: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async findById(id: string): Promise<Customer & { collector?: any }> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  async findByCollector(collectorId: string): Promise<Customer[]> {
    const customers = await prisma.customer.findMany({
      where: {
        collectorId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return customers;
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    // Verify collector exists if provided
    if (input.collectorId) {
      const collector = await prisma.user.findUnique({
        where: { id: input.collectorId },
      });

      if (!collector || collector.role !== UserRole.COLLECTOR) {
        throw new AppError('Invalid collector ID', 400);
      }
    }

    const customer = await prisma.customer.create({
      data: input,
      include: {
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return customer;
  }

  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new AppError('Customer not found', 404);
    }

    // Verify collector exists if being updated
    if (input.collectorId) {
      const collector = await prisma.user.findUnique({
        where: { id: input.collectorId },
      });

      if (!collector || collector.role !== UserRole.COLLECTOR) {
        throw new AppError('Invalid collector ID', 400);
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: input,
      include: {
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return customer;
  }

  async assignCollector(customerId: string, collectorId: string): Promise<Customer> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const collector = await prisma.user.findUnique({
      where: { id: collectorId },
    });

    if (!collector || collector.role !== UserRole.COLLECTOR) {
      throw new AppError('Invalid collector ID', 400);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { collectorId },
      include: {
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedCustomer;
  }

  async delete(id: string): Promise<void> {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new AppError('Customer not found', 404);
    }

    // Soft delete by deactivating
    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateOutstandingBalance(customerId: string): Promise<void> {
    // Calculate total outstanding from unpaid/partial invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId,
        status: { in: ['UNPAID', 'PARTIAL'] },
      },
    });

    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    );

    await prisma.customer.update({
      where: { id: customerId },
      data: { totalOutstanding },
    });
  }
}

export const customersService = new CustomersService();
