import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateDepositInput, DepositQueryInput } from '../schemas/deposit.schema';
import { Deposit, DepositStatus, PaymentStatus } from '@prisma/client';
import { collectorService } from './collector.service';

export class DepositsService {
  async findAll(
    filters: DepositQueryInput = {}
  ): Promise<{ deposits: any[]; total: number }> {
    const { page = 1, limit = 20, collectorId, status, method, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (collectorId) {
      where.collectorId = collectorId;
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

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      prisma.deposit.count({ where }),
    ]);

    return { deposits, total };
  }

  async findById(id: string): Promise<any> {
    const deposit = await prisma.deposit.findUnique({
      where: { id },
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

    if (!deposit) {
      throw new AppError('Deposit not found', 404);
    }

    return deposit;
  }

  async create(input: CreateDepositInput, collectorId: string): Promise<any> {
    // Get wallet details including pending deposits
    const walletDetails = await collectorService.getWalletDetails(collectorId);

    if (input.amount > walletDetails.availableForDeposit) {
      throw new AppError(
        `Deposit amount (${input.amount}) exceeds available balance (${walletDetails.availableForDeposit}). You have ${walletDetails.pendingDeposits} in pending deposits.`,
        400
      );
    }

    const deposit = await prisma.deposit.create({
      data: {
        collectorId,
        amount: input.amount,
        method: input.method,
        notes: input.notes,
      },
      include: {
        collector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return deposit;
  }

  async verify(id: string, approved: boolean, notes?: string): Promise<any> {
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        collector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!deposit) {
      throw new AppError('Deposit not found', 404);
    }

    if (deposit.status !== DepositStatus.PENDING) {
      throw new AppError('Deposit has already been processed', 400);
    }

    const newStatus = approved ? DepositStatus.VERIFIED : DepositStatus.REJECTED;

    // Use a transaction to ensure both operations succeed or fail together
    const updatedDeposit = await prisma.$transaction(async (tx) => {
      const updated = await tx.deposit.update({
        where: { id },
        data: {
          status: newStatus,
          verifiedAt: approved ? new Date() : null,
          notes: notes || deposit.notes,
        },
        include: {
          collector: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Only when deposit is APPROVED, create admin wallet transaction
      if (approved) {
        await tx.adminWalletTransaction.create({
          data: {
            amount: deposit.amount,
            type: 'DEPOSIT_RECEIVED',
            description: `Deposit from ${deposit.collector.name}`,
            depositId: deposit.id,
          },
        });
      }

      return updated;
    });

    // Mark payments as deposited outside the transaction
    if (approved) {
      await this.markPaymentsAsDeposited(deposit.collectorId, deposit.amount);
    }

    return updatedDeposit;
  }

  async uploadReceipt(id: string, receiptPath: string): Promise<any> {
    const deposit = await prisma.deposit.findUnique({
      where: { id },
    });

    if (!deposit) {
      throw new AppError('Deposit not found', 404);
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: { receiptImage: receiptPath },
    });

    return updatedDeposit;
  }

  async getCollectorDeposits(collectorId: string): Promise<any[]> {
    const deposits = await prisma.deposit.findMany({
      where: { collectorId },
      orderBy: { createdAt: 'desc' },
    });

    return deposits;
  }

  async getCollectorWalletBalance(collectorId: string): Promise<number> {
    return collectorService.getWalletBalance(collectorId);
  }

  async getCollectorWalletDetails(collectorId: string): Promise<{
    totalCollected: number;
    verifiedDeposits: number;
    pendingDeposits: number;
    availableForDeposit: number;
  }> {
    return collectorService.getWalletDetails(collectorId);
  }

  private async markPaymentsAsDeposited(collectorId: string, amount: number): Promise<void> {
    // Get pending/verified payments for this collector
    const payments = await prisma.payment.findMany({
      where: {
        collectorId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.VERIFIED] },
      },
      orderBy: { createdAt: 'asc' },
    });

    let remainingAmount = amount;

    for (const payment of payments) {
      if (remainingAmount <= 0) break;

      if (payment.amount <= remainingAmount) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.DEPOSITED },
        });
        remainingAmount -= payment.amount;
      }
    }
  }

  async getPendingDeposits(): Promise<any[]> {
    const deposits = await prisma.deposit.findMany({
      where: { status: DepositStatus.PENDING },
      orderBy: { createdAt: 'asc' },
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

    return deposits;
  }

  async getAdminWalletBalance(): Promise<number> {
    const result = await prisma.adminWalletTransaction.aggregate({
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  async getAdminWalletTransactions(): Promise<any[]> {
    const transactions = await prisma.adminWalletTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        deposit: {
          include: {
            collector: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return transactions;
  }
}

export const depositsService = new DepositsService();
