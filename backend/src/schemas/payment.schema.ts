import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createPaymentSchema = z.object({
  invoiceId: z.string().cuid('Invalid invoice ID'),
  amount: z.number().positive('Amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  verified: z.boolean(),
  notes: z.string().optional(),
});

export const paymentIdSchema = z.object({
  id: z.string().cuid('Invalid payment ID'),
});

export const paymentQuerySchema = z.object({
  collectorId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'DEPOSITED']).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
