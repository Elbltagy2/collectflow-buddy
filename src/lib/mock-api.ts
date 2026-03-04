// Mock API layer for frontend-only demo
// Mirrors the exports from api.ts but returns mock data

import {
  mockUsers,
  mockCollectors,
  mockProducts,
  mockProductCategories,
  mockCustomers,
  mockInvoices,
  mockPayments,
  mockDeposits,
  mockComplaints,
  mockComplaintStats,
  mockDashboard,
  mockCollectionsReport,
  mockOutstandingReport,
  mockPerformanceReport,
  mockCollectorStats,
  mockCollectorRoute,
  mockAdminWalletTransactions,
} from './mock-data';

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to wrap data in the standard API response format
const apiResponse = <T>(data: T, meta?: any) => ({ success: true, data, ...(meta ? { meta } : {}) });

// Simple ID generator
let idCounter = 100;
const nextId = () => `mock-${++idCounter}`;

// In-memory mutable state (so mutations work during the session)
let users = [...mockUsers];
let products = [...mockProducts];
let customers = [...mockCustomers];
let invoices = [...mockInvoices];
let payments = [...mockPayments];
let deposits = [...mockDeposits];
let complaints = [...mockComplaints];
let route = [...mockCollectorRoute];

// Token stubs
export const setTokens = (_access: string, _refresh: string) => {};
export const clearTokens = () => {};
export const getAccessToken = () => 'mock-token';

// Current logged-in user (set by authApi.login)
let currentUser = mockUsers[0]; // default admin

// Auth API
export const authApi = {
  login: async (email: string, _password: string) => {
    await delay();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials. Try: admin@demo.com, sales@demo.com, collector@demo.com, accountant@demo.com, manager@demo.com');
    currentUser = user;
    return apiResponse({ user, tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' } });
  },
  logout: async () => { await delay(100); },
  getMe: async () => {
    await delay(100);
    return apiResponse(currentUser);
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    await delay();
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    const slice = users.slice(start, start + limit);
    return apiResponse(slice, { total: users.length, page, limit, totalPages: Math.ceil(users.length / limit) });
  },
  getById: async (id: string) => { await delay(); return apiResponse(users.find(u => u.id === id)); },
  create: async (data: any) => {
    await delay();
    const user = { id: nextId(), ...data };
    users.push(user);
    return apiResponse(user);
  },
  update: async (id: string, data: any) => {
    await delay();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) users[idx] = { ...users[idx], ...data };
    return apiResponse(users[idx]);
  },
  delete: async (id: string) => {
    await delay();
    users = users.filter(u => u.id !== id);
    return apiResponse(undefined);
  },
  getCollectors: async () => {
    await delay();
    return apiResponse(users.filter(u => u.role === 'COLLECTOR'));
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: { page?: number; limit?: number; category?: string }) => {
    await delay();
    let filtered = [...products];
    if (params?.category) filtered = filtered.filter(p => p.category === params.category);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    return apiResponse(filtered.slice(start, start + limit), { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) });
  },
  getById: async (id: string) => { await delay(); return apiResponse(products.find(p => p.id === id)); },
  getCategories: async () => { await delay(); return apiResponse(mockProductCategories); },
  create: async (data: any) => {
    await delay();
    const product = { id: nextId(), ...data };
    products.push(product);
    return apiResponse(product);
  },
  update: async (id: string, data: any) => {
    await delay();
    const idx = products.findIndex(p => p.id === id);
    if (idx >= 0) products[idx] = { ...products[idx], ...data };
    return apiResponse(products[idx]);
  },
  delete: async (id: string) => {
    await delay();
    products = products.filter(p => p.id !== id);
    return apiResponse(undefined);
  },
};

// Customers API
export const customersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; collectorId?: string }) => {
    await delay();
    let filtered = [...customers];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    if (params?.collectorId) filtered = filtered.filter(c => c.collectorId === params.collectorId);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    return apiResponse(filtered.slice(start, start + limit), { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) });
  },
  getById: async (id: string) => { await delay(); return apiResponse(customers.find(c => c.id === id)); },
  create: async (data: any) => {
    await delay();
    const customer = { id: nextId(), totalOutstanding: 0, ...data };
    customers.push(customer);
    return apiResponse(customer);
  },
  update: async (id: string, data: any) => {
    await delay();
    const idx = customers.findIndex(c => c.id === id);
    if (idx >= 0) customers[idx] = { ...customers[idx], ...data };
    return apiResponse(customers[idx]);
  },
  assignCollector: async (id: string, collectorId: string) => {
    await delay();
    const idx = customers.findIndex(c => c.id === id);
    if (idx >= 0) customers[idx].collectorId = collectorId;
    return apiResponse(customers[idx]);
  },
  delete: async (id: string) => {
    await delay();
    customers = customers.filter(c => c.id !== id);
    return apiResponse(undefined);
  },
};

// Invoices API
export const invoicesApi = {
  getAll: async (params?: { page?: number; limit?: number; customerId?: string; status?: string }) => {
    await delay();
    let filtered = [...invoices];
    if (params?.customerId) filtered = filtered.filter(i => i.customerId === params.customerId);
    if (params?.status) filtered = filtered.filter(i => i.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    return apiResponse(filtered.slice(start, start + limit), { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) });
  },
  getById: async (id: string) => { await delay(); return apiResponse(invoices.find(i => i.id === id)); },
  getByCustomer: async (customerId: string) => {
    await delay();
    return apiResponse(invoices.filter(i => i.customerId === customerId));
  },
  getOutstanding: async (collectorId?: string) => {
    await delay();
    let outstanding = invoices.filter(i => i.status !== 'paid');
    if (collectorId) {
      const customerIds = customers.filter(c => c.collectorId === collectorId).map(c => c.id);
      outstanding = outstanding.filter(i => customerIds.includes(i.customerId));
    }
    return apiResponse(outstanding);
  },
  create: async (data: any) => {
    await delay();
    const invoice = { id: nextId(), invoiceNo: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`, paidAmount: 0, status: 'unpaid', createdAt: new Date().toISOString(), ...data };
    invoices.push(invoice);
    return apiResponse(invoice);
  },
  uploadExcel: async (_file: File) => {
    await delay(500);
    return { success: true, data: { rows: [{ customerName: 'Sample Customer', productName: 'Premium Water Filter', quantity: 1, unitPrice: 1500 }], message: 'Mock: 1 row parsed' } };
  },
  createFromExcel: async (_rows: any[], _dueDate: string) => {
    await delay();
    return apiResponse({ created: 1, message: 'Mock: 1 invoice created from Excel' });
  },
  update: async (id: string, data: any) => {
    await delay();
    const idx = invoices.findIndex(i => i.id === id);
    if (idx >= 0) invoices[idx] = { ...invoices[idx], ...data };
    return apiResponse(invoices[idx]);
  },
  delete: async (id: string) => {
    await delay();
    invoices = invoices.filter(i => i.id !== id);
    return apiResponse(undefined);
  },
};

// Payments API
export const paymentsApi = {
  getAll: async (params?: { page?: number; limit?: number; collectorId?: string; status?: string }) => {
    await delay();
    let filtered = [...payments];
    if (params?.collectorId) filtered = filtered.filter(p => p.collectorId === params.collectorId);
    if (params?.status) filtered = filtered.filter(p => p.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    return apiResponse(filtered.slice(start, start + limit), { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) });
  },
  getById: async (id: string) => { await delay(); return apiResponse(payments.find(p => p.id === id)); },
  getPendingVerification: async () => {
    await delay();
    return apiResponse(payments.filter(p => p.status === 'pending'));
  },
  create: async (data: any) => {
    await delay();
    const payment = { id: nextId(), status: 'pending', createdAt: new Date().toISOString(), ...data };
    payments.push(payment);
    // Update invoice paidAmount
    const inv = invoices.find(i => i.id === data.invoiceId);
    if (inv) {
      inv.paidAmount += data.amount;
      inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : 'partial';
    }
    return apiResponse(payment);
  },
  uploadReceipt: async (_id: string, _file: File) => {
    await delay();
    return { success: true };
  },
  verify: async (id: string, verified: boolean, _notes?: string) => {
    await delay();
    const idx = payments.findIndex(p => p.id === id);
    if (idx >= 0) payments[idx].status = verified ? 'verified' : 'pending';
    return apiResponse(payments[idx]);
  },
};

// Deposits API
export const depositsApi = {
  getAll: async (params?: { page?: number; limit?: number; collectorId?: string; status?: string }) => {
    await delay();
    let filtered = [...deposits];
    if (params?.collectorId) filtered = filtered.filter(d => d.collectorId === params.collectorId);
    if (params?.status) filtered = filtered.filter(d => d.status === params.status);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    return apiResponse(filtered.slice(start, start + limit), { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) });
  },
  getById: async (id: string) => { await delay(); return apiResponse(deposits.find(d => d.id === id)); },
  getPending: async () => {
    await delay();
    return apiResponse(deposits.filter(d => d.status === 'pending'));
  },
  getWalletBalance: async () => {
    await delay();
    return apiResponse({ balance: 550 });
  },
  getWalletDetails: async () => {
    await delay();
    return apiResponse({
      totalCollected: 800,
      verifiedDeposits: 250,
      pendingDeposits: 300,
      availableForDeposit: 250,
    });
  },
  getAdminWalletBalance: async () => {
    await delay();
    return apiResponse({ balance: 250 });
  },
  getAdminWalletTransactions: async () => {
    await delay();
    return apiResponse(mockAdminWalletTransactions);
  },
  create: async (data: any) => {
    await delay();
    const deposit = { id: nextId(), status: 'pending' as const, createdAt: new Date().toISOString(), ...data };
    deposits.push(deposit);
    return apiResponse(deposit);
  },
  uploadReceipt: async (_id: string, _file: File) => {
    await delay();
    return { success: true };
  },
  verify: async (id: string, verified: boolean, _notes?: string) => {
    await delay();
    const idx = deposits.findIndex(d => d.id === id);
    if (idx >= 0) deposits[idx].status = verified ? 'verified' : 'pending';
    return apiResponse(deposits[idx]);
  },
};

// Collector API
export const collectorApi = {
  getStats: async () => {
    await delay();
    return apiResponse(mockCollectorStats);
  },
  getRoute: async () => {
    await delay();
    return apiResponse(route);
  },
  markVisited: async (customerId: string, visited: boolean = true) => {
    await delay();
    const idx = route.findIndex(r => r.customerId === customerId);
    if (idx >= 0) route[idx].visited = visited;
    return apiResponse(undefined);
  },
  getWallet: async () => {
    await delay();
    return apiResponse({ balance: 550 });
  },
  saveRouteOrder: async (orderedCustomerIds: string[], _totalDistance?: number, _totalDuration?: number) => {
    await delay();
    // Reorder route based on provided IDs
    const reordered = orderedCustomerIds.map((id, i) => {
      const item = route.find(r => r.customerId === id);
      return item ? { ...item, order: i + 1 } : null;
    }).filter(Boolean) as typeof route;
    route = reordered;
    return apiResponse(undefined);
  },
  getRouteOptimizationInfo: async () => {
    await delay();
    return apiResponse({
      isOptimized: true,
      totalDistance: 25.4,
      totalDuration: 45,
      optimizedAt: '2026-03-04T08:00:00Z',
    });
  },
};

// Reports API
export const reportsApi = {
  getDashboard: async () => {
    await delay();
    return apiResponse(mockDashboard);
  },
  getCollections: async (_params?: { startDate?: string; endDate?: string; collectorId?: string }) => {
    await delay();
    return apiResponse(mockCollectionsReport);
  },
  getOutstanding: async (_collectorId?: string) => {
    await delay();
    return apiResponse(mockOutstandingReport);
  },
  getPerformance: async (_params?: { startDate?: string; endDate?: string }) => {
    await delay();
    return apiResponse(mockPerformanceReport);
  },
};

// Complaints API
export const complaintsApi = {
  getAll: async (_params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
    await delay();
    let filtered = [...complaints];
    if (_params?.status) filtered = filtered.filter(c => c.status === _params.status);
    if (_params?.priority) filtered = filtered.filter(c => c.priority === _params.priority);
    return { complaints: filtered };
  },
  getMine: async (_params?: { page?: number; limit?: number }) => {
    await delay();
    const mine = complaints.filter(c => c.user.id === currentUser.id);
    return { complaints: mine };
  },
  getById: async (id: string) => {
    await delay();
    return complaints.find(c => c.id === id);
  },
  getStats: async () => {
    await delay();
    return mockComplaintStats;
  },
  create: async (data: { title: string; description: string; priority?: string }) => {
    await delay();
    const complaint = {
      id: nextId(),
      ...data,
      status: 'PENDING',
      priority: data.priority || 'MEDIUM',
      response: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
      user: currentUser,
    };
    complaints.push(complaint);
    return complaint;
  },
  update: async (id: string, data: { status?: string; response?: string }) => {
    await delay();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx >= 0) {
      complaints[idx] = { ...complaints[idx], ...data } as any;
      if (data.status === 'RESOLVED') complaints[idx].resolvedAt = new Date().toISOString();
    }
    return complaints[idx];
  },
};

// Route Optimization API
export const routeOptimizationApi = {
  getOptimizedRoute: async () => {
    await delay();
    return apiResponse(route);
  },
  optimizeCustomRoute: async (_customerIds: string[]) => {
    await delay();
    return apiResponse(route);
  },
};
