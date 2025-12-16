import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/errorHandler';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { SafeUser, PaginationParams } from '../types';
import { UserRole } from '@prisma/client';

export class UsersService {
  async findAll(params: PaginationParams = {}): Promise<{ users: SafeUser[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { users: users as SafeUser[], total };
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user as SafeUser;
  }

  async findByRole(role: UserRole): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      where: { role, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users as SafeUser[];
  }

  async create(input: CreateUserInput): Promise<SafeUser> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        ...input,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as SafeUser;
  }

  async update(id: string, input: UpdateUserInput): Promise<SafeUser> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Check email uniqueness if email is being updated
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (emailExists) {
        throw new AppError('Email already in use', 409);
      }
    }

    // Hash password if being updated
    const updateData = { ...input };
    if (input.password) {
      updateData.password = await hashPassword(input.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as SafeUser;
  }

  async delete(id: string): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCollectors(): Promise<SafeUser[]> {
    return this.findByRole(UserRole.COLLECTOR);
  }
}

export const usersService = new UsersService();
