import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateInvoiceInput, UpdateInvoiceInput, InvoiceQueryInput } from '../schemas/invoice.schema';
import { Invoice, InvoiceStatus } from '@prisma/client';

export class InvoicesService {
  async findAll(
    filters: InvoiceQueryInput = {}
  ): Promise<{ invoices: any[]; total: number }> {
    const { page = 1, limit = 20, customerId, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  async findById(id: string): Promise<any> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }

  async findByCustomer(customerId: string): Promise<any[]> {
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return invoices;
  }

  async create(input: CreateInvoiceInput, createdById: string): Promise<any> {
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Verify all products exist and calculate totals
    const productIds = input.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new AppError('One or more products not found', 400);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate total amount
    let totalAmount = 0;
    const itemsData = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const total = item.quantity * item.unitPrice;
      totalAmount += total;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total,
      };
    });

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${String(count + 1).padStart(5, '0')}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        customerId: input.customerId,
        createdById,
        totalAmount,
        dueDate: new Date(input.dueDate),
        notes: input.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update customer's outstanding balance and last purchase date
    await prisma.customer.update({
      where: { id: input.customerId },
      data: {
        totalOutstanding: { increment: totalAmount },
        lastPurchaseDate: new Date(),
      },
    });

    // Auto-add customer to collector's route for the due date
    if (customer.collectorId) {
      await this.addCustomerToRoute(customer.collectorId, customer.id, new Date(input.dueDate));
    }

    return invoice;
  }

  async update(id: string, input: UpdateInvoiceInput): Promise<any> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        notes: input.notes,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return updatedInvoice;
  }

  async delete(id: string): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.paidAmount > 0) {
      throw new AppError('Cannot delete invoice with payments', 400);
    }

    // Update customer's outstanding balance
    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: {
        totalOutstanding: { decrement: invoice.totalAmount },
      },
    });

    // Delete invoice (cascades to items)
    await prisma.invoice.delete({
      where: { id },
    });
  }

  async updateInvoiceStatus(invoiceId: string): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) return;

    let status: InvoiceStatus;

    if (invoice.paidAmount >= invoice.totalAmount) {
      status = InvoiceStatus.PAID;
    } else if (invoice.paidAmount > 0) {
      status = InvoiceStatus.PARTIAL;
    } else {
      status = InvoiceStatus.UNPAID;
    }

    if (status !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
      });
    }
  }

  async getOutstandingInvoices(collectorId?: string): Promise<any[]> {
    const where: any = {
      status: { in: ['UNPAID', 'PARTIAL'] },
    };

    if (collectorId) {
      where.customer = {
        collectorId,
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            collectorId: true,
          },
        },
      },
    });

    return invoices;
  }

  // Helper to add customer to collector's route for a specific date
  private async addCustomerToRoute(collectorId: string, customerId: string, dueDate: Date): Promise<void> {
    // Normalize the date to start of day
    const routeDate = new Date(dueDate);
    routeDate.setHours(0, 0, 0, 0);

    // Check if customer is already in the route for this date
    const existingVisit = await prisma.collectorVisit.findFirst({
      where: {
        collectorId,
        customerId,
        visitDate: {
          gte: routeDate,
          lt: new Date(routeDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingVisit) {
      // Reset visited status since new invoice was added
      if (existingVisit.visited) {
        await prisma.collectorVisit.update({
          where: { id: existingVisit.id },
          data: {
            visited: false,
            visitedAt: null,
          },
        });
      }
      return;
    }

    // Get the current max order for this collector on this date
    const maxOrder = await prisma.collectorVisit.aggregate({
      where: {
        collectorId,
        visitDate: {
          gte: routeDate,
          lt: new Date(routeDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _max: { visitOrder: true },
    });

    const nextOrder = (maxOrder._max.visitOrder || 0) + 1;

    // Create the visit entry
    await prisma.collectorVisit.create({
      data: {
        collectorId,
        customerId,
        visitDate: routeDate,
        visitOrder: nextOrder,
        visited: false,
      },
    });
  }
}

export const invoicesService = new InvoicesService();
