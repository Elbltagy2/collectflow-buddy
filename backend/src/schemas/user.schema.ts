import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
  avatar: z.string().url().optional(),
  homeLatitude: z.number().min(-90).max(90).optional().nullable(),
  homeLongitude: z.number().min(-180).max(180).optional().nullable(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.nativeEnum(UserRole).optional(),
  avatar: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  homeLatitude: z.number().min(-90).max(90).optional().nullable(),
  homeLongitude: z.number().min(-180).max(180).optional().nullable(),
});

export const userIdSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
