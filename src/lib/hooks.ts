import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productsApi,
  customersApi,
  invoicesApi,
  paymentsApi,
  depositsApi,
  collectorApi,
  reportsApi,
  usersApi,
} from './api';

// Query Keys
export const queryKeys = {
  products: ['products'] as const,
  productById: (id: string) => ['products', id] as const,
  productCategories: ['products', 'categories'] as const,

  customers: ['customers'] as const,
  customerById: (id: string) => ['customers', id] as const,

  invoices: ['invoices'] as const,
  invoiceById: (id: string) => ['invoices', id] as const,
  invoicesByCustomer: (customerId: string) => ['invoices', 'customer', customerId] as const,
  outstandingInvoices: ['invoices', 'outstanding'] as const,

  payments: ['payments'] as const,
  paymentById: (id: string) => ['payments', id] as const,
  pendingPayments: ['payments', 'pending'] as const,

  deposits: ['deposits'] as const,
  depositById: (id: string) => ['deposits', id] as const,
  pendingDeposits: ['deposits', 'pending'] as const,
  walletBalance: ['deposits', 'wallet'] as const,
  walletDetails: ['deposits', 'walletDetails'] as const,
  adminWallet: ['deposits', 'adminWallet'] as const,

  collectorStats: ['collector', 'stats'] as const,
  collectorRoute: ['collector', 'route'] as const,
  collectorWallet: ['collector', 'wallet'] as const,

  users: ['users'] as const,
  userById: (id: string) => ['users', id] as const,
  collectors: ['users', 'collectors'] as const,

  dashboard: ['reports', 'dashboard'] as const,
  collectionsReport: ['reports', 'collections'] as const,
  outstandingReport: ['reports', 'outstanding'] as const,
  performanceReport: ['reports', 'performance'] as const,
};

// Products Hooks
export const useProducts = (params?: { page?: number; limit?: number; category?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.products, params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.productById(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: queryKeys.productCategories,
    queryFn: () => productsApi.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

// Customers Hooks
export const useCustomers = (params?: { page?: number; limit?: number; search?: string; collectorId?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.customers, params],
    queryFn: () => customersApi.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: queryKeys.customerById(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

export const useAssignCollector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, collectorId }: { id: string; collectorId: string }) =>
      customersApi.assignCollector(id, collectorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorRoute });
    },
  });
};

// Invoices Hooks
export const useInvoices = (params?: { page?: number; limit?: number; customerId?: string; status?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.invoices, params],
    queryFn: () => invoicesApi.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: queryKeys.invoiceById(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });
};

export const useInvoicesByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: queryKeys.invoicesByCustomer(customerId),
    queryFn: () => invoicesApi.getByCustomer(customerId),
    enabled: !!customerId,
  });
};

export const useOutstandingInvoices = (collectorId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.outstandingInvoices, collectorId],
    queryFn: () => invoicesApi.getOutstanding(collectorId),
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorRoute });
    },
  });
};

// Payments Hooks
export const usePayments = (params?: { page?: number; limit?: number; collectorId?: string; status?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.payments, params],
    queryFn: () => paymentsApi.getAll(params),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const usePendingPayments = () => {
  return useQuery({
    queryKey: queryKeys.pendingPayments,
    queryFn: () => paymentsApi.getPendingVerification(),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorWallet });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorRoute });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletDetails });
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified, notes }: { id: string; verified: boolean; notes?: string }) =>
      paymentsApi.verify(id, verified, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingPayments });
    },
  });
};

// Deposits Hooks
export const useDeposits = (params?: { page?: number; limit?: number; collectorId?: string; status?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.deposits, params],
    queryFn: () => depositsApi.getAll(params),
  });
};

export const usePendingDeposits = () => {
  return useQuery({
    queryKey: queryKeys.pendingDeposits,
    queryFn: () => depositsApi.getPending(),
  });
};

export const useWalletBalance = () => {
  return useQuery({
    queryKey: queryKeys.walletBalance,
    queryFn: () => depositsApi.getWalletBalance(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useWalletDetails = () => {
  return useQuery({
    queryKey: queryKeys.walletDetails,
    queryFn: () => depositsApi.getWalletDetails(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useAdminWalletBalance = () => {
  return useQuery({
    queryKey: queryKeys.adminWallet,
    queryFn: () => depositsApi.getAdminWalletBalance(),
  });
};

export const useCreateDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: depositsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deposits });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletDetails });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorWallet });
    },
  });
};

export const useVerifyDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified, notes }: { id: string; verified: boolean; notes?: string }) =>
      depositsApi.verify(id, verified, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deposits });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingDeposits });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminWallet });
    },
  });
};

// Collector Hooks
export const useCollectorStats = () => {
  return useQuery({
    queryKey: queryKeys.collectorStats,
    queryFn: () => collectorApi.getStats(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useCollectorRoute = () => {
  return useQuery({
    queryKey: queryKeys.collectorRoute,
    queryFn: () => collectorApi.getRoute(),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCollectorWallet = () => {
  return useQuery({
    queryKey: queryKeys.collectorWallet,
    queryFn: () => collectorApi.getWallet(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useMarkVisited = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, visited }: { customerId: string; visited?: boolean }) =>
      collectorApi.markVisited(customerId, visited),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorRoute });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectorStats });
    },
  });
};

// Users Hooks
export const useUsers = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => usersApi.getAll(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.userById(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

export const useCollectors = () => {
  return useQuery({
    queryKey: queryKeys.collectors,
    queryFn: () => usersApi.getCollectors(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectors });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.collectors });
    },
  });
};

// Reports Hooks
export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => reportsApi.getDashboard(),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCollectionsReport = (params?: { startDate?: string; endDate?: string; collectorId?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.collectionsReport, params],
    queryFn: () => reportsApi.getCollections(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useOutstandingReport = (collectorId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.outstandingReport, collectorId],
    queryFn: () => reportsApi.getOutstanding(collectorId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePerformanceReport = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.performanceReport, params],
    queryFn: () => reportsApi.getPerformance(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
