import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema';
import { PaginationParams } from '../types';
import { Product } from '@prisma/client';

export class ProductsService {
  async findAll(
    params: PaginationParams = {},
    filters: { category?: string; isActive?: boolean } = {}
  ): Promise<{ products: Product[]; total: number }> {
    const { page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async getCategories(): Promise<string[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return products.map((p) => p.category);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const product = await prisma.product.create({
      data: input,
    });

    return product;
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    const product = await prisma.product.update({
      where: { id },
      data: input,
    });

    return product;
  }

  async delete(id: string): Promise<void> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    // Soft delete by deactivating
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const productsService = new ProductsService();
