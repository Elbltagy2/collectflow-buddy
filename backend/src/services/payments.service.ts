import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreatePaymentInput, PaymentQueryInput } from '../schemas/payment.schema';
import { invoicesService } from './invoices.service';
import { customersService } from './customers.service';
import { Payment, PaymentStatus } from '@prisma/client';

export class PaymentsService {
  async findAll(
    filters: PaymentQueryInput = {}
  ): Promise<{ payments: any[]; total: number }> {
    const { page = 1, limit = 20, collectorId, customerId, status, method, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (collectorId) {
      where.collectorId = collectorId;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (status) {
      where.status = status;
    }
    if (method) {
      where.method = method;
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

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNo: true,
              totalAmount: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          collector: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async findById(id: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
        customer: true,
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  async create(input: CreatePaymentInput, collectorId: string): Promise<any> {
    // Get invoice details
    const invoice = await prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Check if payment amount is valid
    const remainingBalance = invoice.totalAmount - invoice.paidAmount;
    if (input.amount > remainingBalance) {
      throw new AppError(
        `Payment amount (${input.amount}) exceeds remaining balance (${remainingBalance})`,
        400
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: input.invoiceId,
        customerId: invoice.customerId,
        collectorId,
        amount: input.amount,
        method: input.method,
        notes: input.notes,
      },
      include: {
        invoice: true,
        customer: true,
        collector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update invoice paid amount
    await prisma.invoice.update({
      where: { id: input.invoiceId },
      data: {
        paidAmount: { increment: input.amount },
      },
    });

    // Update invoice status
    await invoicesService.updateInvoiceStatus(input.invoiceId);

    // Update customer outstanding balance
    await customersService.updateOutstandingBalance(invoice.customerId);

    return payment;
  }

  async verify(id: string, verified: boolean, notes?: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError('Payment has already been processed', 400);
    }

    const newStatus = verified ? PaymentStatus.VERIFIED : PaymentStatus.PENDING;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedAt: verified ? new Date() : null,
        notes: notes || payment.notes,
      },
      include: {
        invoice: true,
        customer: true,
        collector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedPayment;
  }

  async uploadReceipt(id: string, receiptPath: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { receiptImage: receiptPath },
    });

    return updatedPayment;
  }

  async getCollectorPayments(collectorId: string, status?: PaymentStatus): Promise<any[]> {
    const where: any = { collectorId };
    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return payments;
  }

  async getPendingVerification(): Promise<any[]> {
    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        method: 'FAWRY', // Fawry payments need receipt verification
      },
      orderBy: { createdAt: 'asc' },
      include: {
        invoice: true,
        customer: true,
        collector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return payments;
  }
}

export const paymentsService = new PaymentsService();
