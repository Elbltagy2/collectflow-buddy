import { Request, Response, NextFunction } from 'express';
import { productsService } from '../services/products.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema';

export class ProductsController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const sortBy = (req.query.sortBy as string) || 'name';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
      const category = req.query.category as string;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const { products, total } = await productsService.findAll(
        { page, limit, sortBy, sortOrder },
        { category, isActive }
      );

      sendPaginated(res, products, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productsService.findById(id);

      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productsService.getCategories();

      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateProductInput = req.body;
      const product = await productsService.create(input);

      sendCreated(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateProductInput = req.body;
      const product = await productsService.update(id, input);

      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productsService.delete(id);

      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();
