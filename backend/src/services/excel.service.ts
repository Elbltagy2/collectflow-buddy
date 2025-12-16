import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface ParsedInvoiceRow {
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  status: 'valid' | 'error';
  error?: string;
  customerId?: string;
  productId?: string;
}

interface ParsedInvoiceResult {
  rows: ParsedInvoiceRow[];
  validCount: number;
  errorCount: number;
  totalAmount: number;
}

export class ExcelService {
  async parseInvoiceFile(filePath: string): Promise<ParsedInvoiceResult> {
    // Read the file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(sheet);

    if (!rawData || rawData.length === 0) {
      throw new AppError('Excel file is empty or invalid', 400);
    }

    const rows: ParsedInvoiceRow[] = [];
    let validCount = 0;
    let errorCount = 0;
    let totalAmount = 0;

    // Get all customers and products for lookup
    const [customers, products] = await Promise.all([
      prisma.customer.findMany({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true } }),
    ]);

    const customerMap = new Map(
      customers.map((c) => [c.name.toLowerCase(), c])
    );
    const productMap = new Map(
      products.map((p) => [p.name.toLowerCase(), p])
    );

    for (const row of rawData as any[]) {
      const customerName = String(row.customer_name || row.customerName || row.Customer || '').trim();
      const productName = String(row.product_name || row.productName || row.Product || '').trim();
      const quantity = parseInt(row.quantity || row.Quantity || 0, 10);
      const unitPrice = parseFloat(row.unit_price || row.unitPrice || row.Price || 0);

      const parsedRow: ParsedInvoiceRow = {
        customerName,
        productName,
        quantity,
        unitPrice,
        status: 'valid',
      };

      // Validate customer
      const customer = customerMap.get(customerName.toLowerCase());
      if (!customer) {
        parsedRow.status = 'error';
        parsedRow.error = 'Customer not found';
        errorCount++;
        rows.push(parsedRow);
        continue;
      }
      parsedRow.customerId = customer.id;

      // Validate product
      const product = productMap.get(productName.toLowerCase());
      if (!product) {
        parsedRow.status = 'error';
        parsedRow.error = 'Product not found';
        errorCount++;
        rows.push(parsedRow);
        continue;
      }
      parsedRow.productId = product.id;

      // Use product price if unit price not provided
      if (!parsedRow.unitPrice || parsedRow.unitPrice <= 0) {
        parsedRow.unitPrice = product.price;
      }

      // Validate quantity
      if (!quantity || quantity <= 0) {
        parsedRow.status = 'error';
        parsedRow.error = 'Invalid quantity';
        errorCount++;
        rows.push(parsedRow);
        continue;
      }

      validCount++;
      totalAmount += parsedRow.unitPrice * quantity;
      rows.push(parsedRow);
    }

    return {
      rows,
      validCount,
      errorCount,
      totalAmount,
    };
  }

  async createInvoicesFromParsed(
    parsedRows: ParsedInvoiceRow[],
    createdById: string,
    dueDate: Date
  ): Promise<{ created: number; invoiceIds: string[] }> {
    // Group valid rows by customer
    const validRows = parsedRows.filter((r) => r.status === 'valid');

    if (validRows.length === 0) {
      throw new AppError('No valid rows to create invoices from', 400);
    }

    const customerGroups = new Map<string, ParsedInvoiceRow[]>();

    for (const row of validRows) {
      const customerId = row.customerId!;
      if (!customerGroups.has(customerId)) {
        customerGroups.set(customerId, []);
      }
      customerGroups.get(customerId)!.push(row);
    }

    const invoiceIds: string[] = [];

    // Create an invoice for each customer
    for (const [customerId, items] of customerGroups) {
      // Generate invoice number
      const count = await prisma.invoice.count();
      const invoiceNo = `INV-${String(count + 1).padStart(5, '0')}`;

      // Calculate total
      const totalAmount = items.reduce(
        (sum, item) => sum + item.unitPrice! * item.quantity,
        0
      );

      // Create invoice with items
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNo,
          customerId,
          createdById,
          totalAmount,
          dueDate,
          items: {
            create: items.map((item) => ({
              productId: item.productId!,
              quantity: item.quantity,
              unitPrice: item.unitPrice!,
              total: item.unitPrice! * item.quantity,
            })),
          },
        },
      });

      invoiceIds.push(invoice.id);

      // Update customer's last purchase date and get collector info
      const customer = await prisma.customer.update({
        where: { id: customerId },
        data: {
          lastPurchaseDate: new Date(),
          totalOutstanding: { increment: totalAmount },
        },
      });

      // Auto-add customer to collector's route for the due date
      if (customer.collectorId) {
        await this.addCustomerToRoute(customer.collectorId, customerId, dueDate);
      }
    }

    return {
      created: invoiceIds.length,
      invoiceIds,
    };
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

  // Clean up uploaded file
  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

export const excelService = new ExcelService();
