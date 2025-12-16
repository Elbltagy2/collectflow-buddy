import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  email: z.string().email('Invalid email address').optional(),
  collectorId: z.string().cuid('Invalid collector ID').optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  email: z.string().email('Invalid email address').optional().nullable(),
  collectorId: z.string().cuid('Invalid collector ID').optional().nullable(),
  isActive: z.boolean().optional(),
});

export const assignCollectorSchema = z.object({
  collectorId: z.string().cuid('Invalid collector ID'),
});

export const customerIdSchema = z.object({
  id: z.string().cuid('Invalid customer ID'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AssignCollectorInput = z.infer<typeof assignCollectorSchema>;
