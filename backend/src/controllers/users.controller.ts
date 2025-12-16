import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

export class UsersController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const { users, total } = await usersService.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      sendPaginated(res, users, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await usersService.findById(id);

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateUserInput = req.body;
      const user = await usersService.create(input);

      sendCreated(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateUserInput = req.body;
      const user = await usersService.update(id, input);

      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await usersService.delete(id);

      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCollectors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collectors = await usersService.getCollectors();

      sendSuccess(res, collectors);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
