import { Request } from 'express';
import { User, UserRole } from '@prisma/client';

// Extended Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// JWT Payload
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  id: string;
  tokenVersion?: number;
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// User types (without password)
export type SafeUser = Omit<User, 'password'>;

// Collector stats
export interface CollectorStats {
  collectorId: string;
  collectorName: string;
  totalCollected: number;
  cashAmount: number;
  fawryAmount: number;
  walletBalance: number;
  customersVisited: number;
  totalCustomers: number;
}

// Daily route item
export interface DailyRouteItem {
  customerId: string;
  customerName: string;
  address: string;
  phone: string;
  outstandingAmount: number;
  visited: boolean;
  order: number;
}

// Report filters
export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  collectorId?: string;
  customerId?: string;
  status?: string;
}
