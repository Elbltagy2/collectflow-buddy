import { z } from 'zod';

const invoiceItemSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().cuid('Invalid customer ID'),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().optional().nullable(),
});

export const invoiceIdSchema = z.object({
  id: z.string().cuid('Invalid invoice ID'),
});

export const invoiceQuerySchema = z.object({
  customerId: z.string().cuid().optional(),
  status: z.enum(['PAID', 'PARTIAL', 'UNPAID']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;
