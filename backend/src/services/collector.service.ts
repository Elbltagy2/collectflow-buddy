import prisma from '../config/database';
import { CollectorStats, DailyRouteItem } from '../types';
import { PaymentStatus, DepositStatus } from '@prisma/client';

export class CollectorService {
  async getStats(collectorId: string): Promise<CollectorStats> {
    // Get collector info
    const collector = await prisma.user.findUnique({
      where: { id: collectorId },
      select: { id: true, name: true },
    });

    if (!collector) {
      throw new Error('Collector not found');
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's payments
    const todayPayments = await prisma.payment.findMany({
      where: {
        collectorId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalCollected = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const cashAmount = todayPayments
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);
    const fawryAmount = todayPayments
      .filter((p) => p.method === 'FAWRY')
      .reduce((sum, p) => sum + p.amount, 0);

    // Get wallet balance
    const walletBalance = await this.getWalletBalance(collectorId);

    // Get customer counts
    const totalCustomers = await prisma.customer.count({
      where: { collectorId, isActive: true },
    });

    // Get today's visits
    const todayVisits = await prisma.collectorVisit.count({
      where: {
        collectorId,
        visitDate: {
          gte: today,
          lt: tomorrow,
        },
        visited: true,
      },
    });

    return {
      collectorId: collector.id,
      collectorName: collector.name,
      totalCollected,
      cashAmount,
      fawryAmount,
      walletBalance,
      customersVisited: todayVisits,
      totalCustomers,
    };
  }

  async getDailyRoute(collectorId: string): Promise<DailyRouteItem[]> {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if route exists for today
    let visits = await prisma.collectorVisit.findMany({
      where: {
        collectorId,
        visitDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { visitOrder: 'asc' },
    });

    // If no route exists, generate one from assigned customers
    if (visits.length === 0) {
      visits = await this.generateDailyRoute(collectorId, today);
    }

    // Get customer details for the route
    const customerIds = visits.map((v) => v.customerId);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return visits.map((visit) => {
      const customer = customerMap.get(visit.customerId);
      return {
        customerId: visit.customerId,
        customerName: customer?.name || 'Unknown',
        address: customer?.address || '',
        phone: customer?.phone || '',
        outstandingAmount: customer?.totalOutstanding || 0,
        visited: visit.visited,
        order: visit.visitOrder,
      };
    });
  }

  private async generateDailyRoute(collectorId: string, date: Date): Promise<any[]> {
    // Get customers with outstanding balance, prioritized by amount
    const customers = await prisma.customer.findMany({
      where: {
        collectorId,
        isActive: true,
        totalOutstanding: { gt: 0 },
      },
      orderBy: { totalOutstanding: 'desc' },
      take: 40, // Limit daily route to 40 customers
    });

    // Create visit records
    const visits = await Promise.all(
      customers.map((customer, index) =>
        prisma.collectorVisit.create({
          data: {
            collectorId,
            customerId: customer.id,
            visitDate: date,
            visitOrder: index + 1,
            visited: false,
          },
        })
      )
    );

    return visits;
  }

  async markCustomerVisited(
    collectorId: string,
    customerId: string,
    visited: boolean = true
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.collectorVisit.updateMany({
      where: {
        collectorId,
        customerId,
        visitDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      data: {
        visited,
        visitedAt: visited ? new Date() : null,
      },
    });
  }

  async getWalletBalance(collectorId: string): Promise<number> {
    // Total from non-deposited payments
    const paymentsResult = await prisma.payment.aggregate({
      where: {
        collectorId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.VERIFIED] },
      },
      _sum: { amount: true },
    });

    const totalPending = paymentsResult._sum.amount || 0;

    // Subtract pending deposits (not yet verified)
    const pendingDepositsResult = await prisma.deposit.aggregate({
      where: {
        collectorId,
        status: DepositStatus.PENDING,
      },
      _sum: { amount: true },
    });

    const pendingDeposits = pendingDepositsResult._sum.amount || 0;

    return totalPending - pendingDeposits;
  }
}

export const collectorService = new CollectorService();
