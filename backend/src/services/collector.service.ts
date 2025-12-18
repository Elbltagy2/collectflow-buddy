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

    // Get route from CollectorVisit table (created when invoices are assigned)
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

    // If no visits for today, show all customers with outstanding balance
    // and invoices due today or overdue
    if (visits.length === 0) {
      // Get all customers assigned to this collector with outstanding balance
      const customers = await prisma.customer.findMany({
        where: {
          collectorId,
          isActive: true,
          totalOutstanding: { gt: 0 },
        },
        orderBy: { totalOutstanding: 'desc' },
        include: {
          invoices: {
            where: {
              status: { in: ['UNPAID', 'PARTIAL'] },
              dueDate: { lte: tomorrow }, // Due today or overdue
            },
            orderBy: { dueDate: 'asc' },
          },
        },
      });

      return customers.map((customer, index) => {
        const unpaidInvoices = customer.invoices.filter(
          (inv) => inv.totalAmount > inv.paidAmount
        );
        const todayDue = unpaidInvoices.reduce(
          (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
          0
        );

        return {
          customerId: customer.id,
          customerName: customer.name,
          address: customer.address,
          phone: customer.phone,
          outstandingAmount: customer.totalOutstanding,
          todayDueAmount: todayDue,
          visited: false,
          order: index + 1,
          latitude: customer.latitude,
          longitude: customer.longitude,
          invoices: unpaidInvoices.map((inv) => ({
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            totalAmount: inv.totalAmount,
            paidAmount: inv.paidAmount,
            dueDate: inv.dueDate,
            status: inv.status,
          })),
        };
      });
    }

    // Get customer details with invoices for the route
    // Include invoices due today or overdue (not future ones)
    const customerIds = visits.map((v) => v.customerId);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      include: {
        invoices: {
          where: {
            status: { in: ['UNPAID', 'PARTIAL'] },
            dueDate: { lte: tomorrow }, // Due today or overdue
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return visits.map((visit) => {
      const customer = customerMap.get(visit.customerId);
      const unpaidInvoices = customer?.invoices.filter(
        (inv) => inv.totalAmount > inv.paidAmount
      ) || [];
      const todayDue = unpaidInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
        0
      );

      return {
        customerId: visit.customerId,
        customerName: customer?.name || 'Unknown',
        address: customer?.address || '',
        phone: customer?.phone || '',
        outstandingAmount: customer?.totalOutstanding || 0,
        todayDueAmount: todayDue,
        visited: visit.visited,
        order: visit.visitOrder,
        latitude: customer?.latitude,
        longitude: customer?.longitude,
        invoices: unpaidInvoices.map((inv) => ({
          id: inv.id,
          invoiceNo: inv.invoiceNo,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          dueDate: inv.dueDate,
          status: inv.status,
        })),
      };
    });
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

    // Check if visit entry exists for today
    const existingVisit = await prisma.collectorVisit.findFirst({
      where: {
        collectorId,
        customerId,
        visitDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingVisit) {
      // Update existing visit
      await prisma.collectorVisit.update({
        where: { id: existingVisit.id },
        data: {
          visited,
          visitedAt: visited ? new Date() : null,
        },
      });
    } else {
      // Create new visit entry (for fallback route case)
      const maxOrder = await prisma.collectorVisit.aggregate({
        where: {
          collectorId,
          visitDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        _max: { visitOrder: true },
      });

      await prisma.collectorVisit.create({
        data: {
          collectorId,
          customerId,
          visitDate: today,
          visitOrder: (maxOrder._max.visitOrder || 0) + 1,
          visited,
          visitedAt: visited ? new Date() : null,
        },
      });
    }
  }

  async getWalletBalance(collectorId: string): Promise<number> {
    const details = await this.getWalletDetails(collectorId);
    return details.availableForDeposit;
  }

  async saveOptimizedRouteOrder(
    collectorId: string,
    orderedCustomerIds: string[],
    totalDistance?: number,
    totalDuration?: number
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Update visit order for each customer
    for (let i = 0; i < orderedCustomerIds.length; i++) {
      const customerId = orderedCustomerIds[i];

      // Check if visit entry exists for today
      const existingVisit = await prisma.collectorVisit.findFirst({
        where: {
          collectorId,
          customerId,
          visitDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (existingVisit) {
        // Update existing visit order
        await prisma.collectorVisit.update({
          where: { id: existingVisit.id },
          data: {
            visitOrder: i + 1,
            optimizedAt: new Date(),
            optimizedDistance: totalDistance,
            optimizedDuration: totalDuration,
          },
        });
      } else {
        // Create new visit entry with optimized order
        await prisma.collectorVisit.create({
          data: {
            collectorId,
            customerId,
            visitDate: today,
            visitOrder: i + 1,
            visited: false,
            optimizedAt: new Date(),
            optimizedDistance: totalDistance,
            optimizedDuration: totalDuration,
          },
        });
      }
    }
  }

  async getRouteOptimizationInfo(collectorId: string): Promise<{
    isOptimized: boolean;
    totalDistance?: number;
    totalDuration?: number;
    optimizedAt?: Date;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visit = await prisma.collectorVisit.findFirst({
      where: {
        collectorId,
        visitDate: {
          gte: today,
          lt: tomorrow,
        },
        optimizedAt: { not: null },
      },
      select: {
        optimizedAt: true,
        optimizedDistance: true,
        optimizedDuration: true,
      },
    });

    if (visit && visit.optimizedAt) {
      return {
        isOptimized: true,
        totalDistance: visit.optimizedDistance || undefined,
        totalDuration: visit.optimizedDuration || undefined,
        optimizedAt: visit.optimizedAt,
      };
    }

    return { isOptimized: false };
  }

  async getWalletDetails(collectorId: string): Promise<{
    totalCollected: number;
    verifiedDeposits: number;
    pendingDeposits: number;
    availableForDeposit: number;
  }> {
    // Total from non-deposited payments
    const paymentsResult = await prisma.payment.aggregate({
      where: {
        collectorId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.VERIFIED] },
      },
      _sum: { amount: true },
    });

    const totalCollected = paymentsResult._sum.amount || 0;

    // Get VERIFIED (approved) deposits
    const verifiedDepositsResult = await prisma.deposit.aggregate({
      where: {
        collectorId,
        status: DepositStatus.VERIFIED,
      },
      _sum: { amount: true },
    });

    const verifiedDeposits = verifiedDepositsResult._sum.amount || 0;

    // Get PENDING deposits (waiting for admin approval)
    const pendingDepositsResult = await prisma.deposit.aggregate({
      where: {
        collectorId,
        status: DepositStatus.PENDING,
      },
      _sum: { amount: true },
    });

    const pendingDeposits = pendingDepositsResult._sum.amount || 0;

    // Available = Total collected - verified deposits - pending deposits
    // Ensure it's never negative
    const availableForDeposit = Math.max(0, totalCollected - verifiedDeposits - pendingDeposits);

    return {
      totalCollected,
      verifiedDeposits,
      pendingDeposits,
      availableForDeposit,
    };
  }
}

export const collectorService = new CollectorService();
