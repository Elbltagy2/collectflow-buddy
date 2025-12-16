import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().positive('Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  price: z.number().positive('Price must be positive').optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  isActive: z.boolean().optional(),
});

export const productIdSchema = z.object({
  id: z.string().cuid('Invalid product ID'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
