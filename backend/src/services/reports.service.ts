import prisma from '../config/database';
import { ReportFilters } from '../types';
import { PaymentStatus, InvoiceStatus } from '@prisma/client';

export class ReportsService {
  async getCollectionsReport(filters: ReportFilters = {}): Promise<any> {
    const { startDate, endDate, collectorId } = filters;

    const where: any = {};

    if (collectorId) {
      where.collectorId = collectorId;
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

    // Get payments grouped by collector
    const payments = await prisma.payment.findMany({
      where,
      include: {
        collector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Aggregate by collector
    const collectorStats = new Map<string, any>();

    for (const payment of payments) {
      const key = payment.collectorId;
      if (!collectorStats.has(key)) {
        collectorStats.set(key, {
          collectorId: payment.collectorId,
          collectorName: payment.collector.name,
          totalCollected: 0,
          cashAmount: 0,
          fawryAmount: 0,
          paymentCount: 0,
        });
      }

      const stats = collectorStats.get(key)!;
      stats.totalCollected += payment.amount;
      stats.paymentCount += 1;

      if (payment.method === 'CASH') {
        stats.cashAmount += payment.amount;
      } else {
        stats.fawryAmount += payment.amount;
      }
    }

    // Calculate totals
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCash = payments
      .filter((p) => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalFawry = payments
      .filter((p) => p.method === 'FAWRY')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      summary: {
        totalCollected,
        totalCash,
        totalFawry,
        totalPayments: payments.length,
      },
      byCollector: Array.from(collectorStats.values()),
    };
  }

  async getOutstandingReport(filters: ReportFilters = {}): Promise<any> {
    const { collectorId } = filters;

    const where: any = {
      status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
    };

    if (collectorId) {
      where.customer = {
        collectorId,
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            collectorId: true,
            collector: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Calculate totals
    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    );

    // Group by customer
    const customerOutstanding = new Map<string, any>();

    for (const invoice of invoices) {
      const key = invoice.customerId;
      if (!customerOutstanding.has(key)) {
        customerOutstanding.set(key, {
          customerId: invoice.customerId,
          customerName: invoice.customer.name,
          customerPhone: invoice.customer.phone,
          collectorId: invoice.customer.collectorId,
          collectorName: invoice.customer.collector?.name || 'Unassigned',
          totalOutstanding: 0,
          invoiceCount: 0,
          oldestDueDate: null,
        });
      }

      const stats = customerOutstanding.get(key)!;
      stats.totalOutstanding += invoice.totalAmount - invoice.paidAmount;
      stats.invoiceCount += 1;

      if (!stats.oldestDueDate || new Date(invoice.dueDate) < new Date(stats.oldestDueDate)) {
        stats.oldestDueDate = invoice.dueDate;
      }
    }

    // Identify overdue
    const today = new Date();
    const overdueInvoices = invoices.filter(
      (inv) => new Date(inv.dueDate) < today
    );
    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    );

    return {
      summary: {
        totalOutstanding,
        overdueAmount,
        totalInvoices: invoices.length,
        overdueInvoices: overdueInvoices.length,
      },
      byCustomer: Array.from(customerOutstanding.values()).sort(
        (a, b) => b.totalOutstanding - a.totalOutstanding
      ),
    };
  }

  async getPerformanceReport(filters: ReportFilters = {}): Promise<any> {
    const { startDate, endDate } = filters;

    // Get all collectors
    const collectors = await prisma.user.findMany({
      where: { role: 'COLLECTOR', isActive: true },
      select: { id: true, name: true },
    });

    const performanceData = await Promise.all(
      collectors.map(async (collector) => {
        const paymentWhere: any = { collectorId: collector.id };
        if (startDate || endDate) {
          paymentWhere.createdAt = {};
          if (startDate) paymentWhere.createdAt.gte = new Date(startDate);
          if (endDate) paymentWhere.createdAt.lte = new Date(endDate);
        }

        // Get payments
        const payments = await prisma.payment.aggregate({
          where: paymentWhere,
          _sum: { amount: true },
          _count: true,
        });

        // Get customer count
        const customerCount = await prisma.customer.count({
          where: { collectorId: collector.id, isActive: true },
        });

        // Get visit stats
        const visitWhere: any = { collectorId: collector.id };
        if (startDate || endDate) {
          visitWhere.visitDate = {};
          if (startDate) visitWhere.visitDate.gte = new Date(startDate);
          if (endDate) visitWhere.visitDate.lte = new Date(endDate);
        }

        const totalVisits = await prisma.collectorVisit.count({
          where: visitWhere,
        });

        const completedVisits = await prisma.collectorVisit.count({
          where: { ...visitWhere, visited: true },
        });

        const visitRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

        return {
          collectorId: collector.id,
          collectorName: collector.name,
          totalCollected: payments._sum.amount || 0,
          paymentCount: payments._count,
          customerCount,
          totalVisits,
          completedVisits,
          visitRate: Math.round(visitRate),
        };
      })
    );

    // Sort by total collected
    performanceData.sort((a, b) => b.totalCollected - a.totalCollected);

    // Add rank
    const rankedData = performanceData.map((data, index) => ({
      ...data,
      rank: index + 1,
    }));

    return {
      collectors: rankedData,
      summary: {
        totalCollectors: collectors.length,
        totalCollected: performanceData.reduce((sum, d) => sum + d.totalCollected, 0),
        averageVisitRate:
          performanceData.length > 0
            ? Math.round(
                performanceData.reduce((sum, d) => sum + d.visitRate, 0) /
                  performanceData.length
              )
            : 0,
      },
    };
  }

  async getDashboardStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's collections
    const todayPayments = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Total outstanding
    const outstandingResult = await prisma.invoice.aggregate({
      where: {
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
      },
      _sum: { totalAmount: true },
    });

    const paidResult = await prisma.invoice.aggregate({
      where: {
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
      },
      _sum: { paidAmount: true },
    });

    const totalOutstanding =
      (outstandingResult._sum.totalAmount || 0) - (paidResult._sum.paidAmount || 0);

    // Pending verifications
    const pendingVerifications = await prisma.payment.count({
      where: {
        status: PaymentStatus.PENDING,
        method: 'FAWRY',
      },
    });

    // Active collectors
    const activeCollectors = await prisma.user.count({
      where: { role: 'COLLECTOR', isActive: true },
    });

    // Total customers
    const totalCustomers = await prisma.customer.count({
      where: { isActive: true },
    });

    return {
      todayCollected: todayPayments._sum.amount || 0,
      todayPayments: todayPayments._count,
      totalOutstanding,
      pendingVerifications,
      activeCollectors,
      totalCustomers,
    };
  }
}

export const reportsService = new ReportsService();
