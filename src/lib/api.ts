const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

// API request helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
      const retryResponse = await fetch(url, { ...options, headers });
      if (!retryResponse.ok) {
        const error = await retryResponse.json();
        throw new Error(error.error || 'Request failed');
      }
      return retryResponse.json();
    } else {
      clearTokens();
      window.location.href = '/';
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    setTokens(data.data.accessToken, data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await request<ApiResponse<{ user: any; tokens: { accessToken: string; refreshToken: string } }>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.data) {
      setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }
    return response;
  },

  logout: async () => {
    await request('/auth/logout', { method: 'POST' });
    clearTokens();
  },

  getMe: () => request<ApiResponse<any>>('/auth/me'),
};

// Users API
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any[]>>(`/users?${query}`);
  },
  getById: (id: string) => request<ApiResponse<any>>(`/users/${id}`),
  create: (data: any) => request<ApiResponse<any>>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<ApiResponse<any>>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<ApiResponse<void>>(`/users/${id}`, { method: 'DELETE' }),
  getCollectors: () => request<ApiResponse<any[]>>('/users/collectors'),
};

// Products API
export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any[]>>(`/products?${query}`);
  },
  getById: (id: string) => request<ApiResponse<any>>(`/products/${id}`),
  getCategories: () => request<ApiResponse<string[]>>('/products/categories'),
  create: (data: any) => request<ApiResponse<any>>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<ApiResponse<any>>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<ApiResponse<void>>(`/products/${id}`, { method: 'DELETE' }),
};

// Customers API
export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; collectorId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any[]>>(`/customers?${query}`);
  },
  getById: (id: string) => request<ApiResponse<any>>(`/customers/${id}`),
  create: (data: any) => request<ApiResponse<any>>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<ApiResponse<any>>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignCollector: (id: string, collectorId: string) =>
    request<ApiResponse<any>>(`/customers/${id}/assign`, { method: 'PUT', body: JSON.stringify({ collectorId }) }),
  delete: (id: string) => request<ApiResponse<void>>(`/customers/${id}`, { method: 'DELETE' }),
};

// Invoices API
export const invoicesApi = {
  getAll: (params?: { page?: number; limit?: number; customerId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any[]>>(`/invoices?${query}`);
  },
  getById: (id: string) => request<ApiResponse<any>>(`/invoices/${id}`),
  getByCustomer: (customerId: string) => request<ApiResponse<any[]>>(`/invoices/customer/${customerId}`),
  getOutstanding: (collectorId?: string) => {
    const query = collectorId ? `?collectorId=${collectorId}` : '';
    return request<ApiResponse<any[]>>(`/invoices/outstanding${query}`);
  },
  create: (data: any) => request<ApiResponse<any>>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  uploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/invoices/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
  createFromExcel: (rows: any[], dueDate: string) =>
    request<ApiResponse<any>>('/invoices/upload/confirm', { method: 'POST', body: JSON.stringify({ rows, dueDate }) }),
  update: (id: string, data: any) => request<ApiResponse<any>>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<ApiResponse<void>>(`/invoices/${id}`, { method: 'DELETE' }),
};

// Payments API
export const paymentsApi = {
  getAll: (params?: { page?: number; limit?: number; collectorId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any[]>>(`/payments?${query}`);
  },
  getById: (id: string) => request<ApiResponse<any>>(`/payments/${id}`),
  getPendingVerification: () => request<ApiResponse<any[]>>('/payments/pending-verification'),
  create: (data: any) => request<ApiResponse<any>>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  uploadReceipt: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${API_BASE_URL}/payments/${id}/receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
  verify: (id: string, verified: boolean, notes?: string) =>
    request<ApiResponse<any>>(`/payments/${id}/verify`, { method: 'PUT', body: JSON.stringify({ verified, notes }) }),
};

// Wallet Details type
interface WalletDetails {
  totalCollected: number;
  verifiedDeposits: number;
  pendingDeposits: number;
  availableForDeposit: number;
}

// Deposits API
export const depositsApi = {
  getAll: (params?: { page?: number; limit?: number; collectorId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any[]>>(`/deposits?${query}`);
  },
  getById: (id: string) => request<ApiResponse<any>>(`/deposits/${id}`),
  getPending: () => request<ApiResponse<any[]>>('/deposits/pending'),
  getWalletBalance: () => request<ApiResponse<{ balance: number }>>('/deposits/wallet-balance'),
  getWalletDetails: () => request<ApiResponse<WalletDetails>>('/deposits/wallet-details'),
  getAdminWalletBalance: () => request<ApiResponse<{ balance: number }>>('/deposits/admin-wallet'),
  getAdminWalletTransactions: () => request<ApiResponse<any[]>>('/deposits/admin-wallet/transactions'),
  create: (data: any) => request<ApiResponse<any>>('/deposits', { method: 'POST', body: JSON.stringify(data) }),
  uploadReceipt: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${API_BASE_URL}/deposits/${id}/receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
  verify: (id: string, verified: boolean, notes?: string) =>
    request<ApiResponse<any>>(`/deposits/${id}/verify`, { method: 'PUT', body: JSON.stringify({ verified, notes }) }),
};

// Collector API
export const collectorApi = {
  getStats: () => request<ApiResponse<any>>('/collector/stats'),
  getRoute: () => request<ApiResponse<any[]>>('/collector/route'),
  markVisited: (customerId: string, visited: boolean = true) =>
    request<ApiResponse<void>>(`/collector/route/${customerId}/visited`, { method: 'PUT', body: JSON.stringify({ visited }) }),
  getWallet: () => request<ApiResponse<{ balance: number }>>('/collector/wallet'),
};

// Reports API
export const reportsApi = {
  getDashboard: () => request<ApiResponse<any>>('/reports/dashboard'),
  getCollections: (params?: { startDate?: string; endDate?: string; collectorId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any>>(`/reports/collections?${query}`);
  },
  getOutstanding: (collectorId?: string) => {
    const query = collectorId ? `?collectorId=${collectorId}` : '';
    return request<ApiResponse<any>>(`/reports/outstanding${query}`);
  },
  getPerformance: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiResponse<any>>(`/reports/performance?${query}`);
  },
};

// Complaints API
export const complaintsApi = {
  getAll: (params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/complaints?${query}`);
  },
  getMine: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/complaints/mine?${query}`);
  },
  getById: (id: string) => request<any>(`/complaints/${id}`),
  getStats: () => request<any>('/complaints/stats'),
  create: (data: { title: string; description: string; priority?: string }) =>
    request<any>('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { status?: string; response?: string }) =>
    request<any>(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

