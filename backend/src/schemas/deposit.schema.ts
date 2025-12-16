import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createDepositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
});

export const verifyDepositSchema = z.object({
  verified: z.boolean(),
  notes: z.string().optional(),
});

export const depositIdSchema = z.object({
  id: z.string().cuid('Invalid deposit ID'),
});

export const depositQuerySchema = z.object({
  collectorId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'VERIFIED']).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateDepositInput = z.infer<typeof createDepositSchema>;
export type VerifyDepositInput = z.infer<typeof verifyDepositSchema>;
export type DepositQueryInput = z.infer<typeof depositQuerySchema>;
