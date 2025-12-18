import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
});

export const updateComplaintSchema = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
  response: z.string().max(1000).optional(),
});

export const complaintIdSchema = z.object({
  id: z.string().cuid(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
