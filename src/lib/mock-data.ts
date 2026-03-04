// Mock data for frontend-only demo

export const mockUsers = [
  { id: 'u1', name: 'Ahmed Admin', email: 'admin@demo.com', role: 'ADMIN' },
  { id: 'u2', name: 'Sara Sales', email: 'sales@demo.com', role: 'SALES_CLERK' },
  { id: 'u3', name: 'Omar Collector', email: 'collector@demo.com', role: 'COLLECTOR' },
  { id: 'u4', name: 'Fatma Accountant', email: 'accountant@demo.com', role: 'ACCOUNTANT' },
  { id: 'u5', name: 'Khaled Manager', email: 'manager@demo.com', role: 'SALES_MANAGER' },
  { id: 'u6', name: 'Youssef Collector', email: 'collector2@demo.com', role: 'COLLECTOR' },
];

export const mockCollectors = mockUsers.filter(u => u.role === 'COLLECTOR');

export const mockProducts = [
  { id: 'p1', name: 'Premium Water Filter', price: 1500, unit: 'piece', category: 'Filters' },
  { id: 'p2', name: 'Standard Water Filter', price: 800, unit: 'piece', category: 'Filters' },
  { id: 'p3', name: 'Replacement Cartridge', price: 250, unit: 'piece', category: 'Accessories' },
  { id: 'p4', name: 'Installation Kit', price: 350, unit: 'set', category: 'Accessories' },
  { id: 'p5', name: 'Water Purifier Tablet', price: 50, unit: 'pack', category: 'Consumables' },
  { id: 'p6', name: 'UV Sterilizer', price: 2200, unit: 'piece', category: 'Devices' },
  { id: 'p7', name: 'Water Softener', price: 3500, unit: 'piece', category: 'Devices' },
  { id: 'p8', name: 'Pipe Connector Set', price: 120, unit: 'set', category: 'Accessories' },
];

export const mockProductCategories = ['Filters', 'Accessories', 'Consumables', 'Devices'];

export const mockCustomers = [
  { id: 'c1', name: 'Mohamed Hassan', phone: '01012345678', address: '15 Tahrir St, Cairo', collectorId: 'u3', totalOutstanding: 3200, lastPurchaseDate: '2026-02-20', latitude: 30.0444, longitude: 31.2357 },
  { id: 'c2', name: 'Amira Saeed', phone: '01098765432', address: '22 Nile Ave, Giza', collectorId: 'u3', totalOutstanding: 1500, lastPurchaseDate: '2026-02-15', latitude: 30.0131, longitude: 31.2089 },
  { id: 'c3', name: 'Tarek Mostafa', phone: '01155566677', address: '8 October St, 6th October', collectorId: 'u3', totalOutstanding: 4800, lastPurchaseDate: '2026-01-28', latitude: 29.9728, longitude: 30.9429 },
  { id: 'c4', name: 'Noura Ali', phone: '01234567890', address: '45 Heliopolis, Cairo', collectorId: 'u6', totalOutstanding: 2100, lastPurchaseDate: '2026-02-25', latitude: 30.0911, longitude: 31.3225 },
  { id: 'c5', name: 'Yasser Ibrahim', phone: '01567891234', address: '10 Maadi St, Cairo', collectorId: 'u6', totalOutstanding: 5500, lastPurchaseDate: '2026-01-10', latitude: 29.9602, longitude: 31.2569 },
  { id: 'c6', name: 'Dina Kamal', phone: '01111222333', address: '33 Zamalek, Cairo', collectorId: 'u3', totalOutstanding: 800, lastPurchaseDate: '2026-03-01', latitude: 30.0626, longitude: 31.2196 },
  { id: 'c7', name: 'Hossam Farid', phone: '01099887766', address: '5 Dokki St, Giza', collectorId: 'u6', totalOutstanding: 3750, lastPurchaseDate: '2026-02-10', latitude: 30.0392, longitude: 31.2012 },
  { id: 'c8', name: 'Laila Mahmoud', phone: '01288776655', address: '17 Nasr City, Cairo', collectorId: 'u3', totalOutstanding: 0, lastPurchaseDate: '2026-02-28', latitude: 30.0511, longitude: 31.3456 },
];

export const mockInvoices = [
  {
    id: 'inv1', invoiceNo: 'INV-2026-001', customerId: 'c1', customerName: 'Mohamed Hassan',
    items: [
      { productId: 'p1', productName: 'Premium Water Filter', quantity: 2, unitPrice: 1500, total: 3000 },
      { productId: 'p3', productName: 'Replacement Cartridge', quantity: 1, unitPrice: 250, total: 250 },
    ],
    totalAmount: 3250, paidAmount: 50, status: 'partial', createdAt: '2026-02-20T10:00:00Z', dueDate: '2026-03-20T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv2', invoiceNo: 'INV-2026-002', customerId: 'c2', customerName: 'Amira Saeed',
    items: [
      { productId: 'p2', productName: 'Standard Water Filter', quantity: 1, unitPrice: 800, total: 800 },
      { productId: 'p4', productName: 'Installation Kit', quantity: 1, unitPrice: 350, total: 350 },
    ],
    totalAmount: 1150, paidAmount: 0, status: 'unpaid', createdAt: '2026-02-15T14:30:00Z', dueDate: '2026-03-15T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv3', invoiceNo: 'INV-2026-003', customerId: 'c3', customerName: 'Tarek Mostafa',
    items: [
      { productId: 'p6', productName: 'UV Sterilizer', quantity: 1, unitPrice: 2200, total: 2200 },
      { productId: 'p3', productName: 'Replacement Cartridge', quantity: 4, unitPrice: 250, total: 1000 },
    ],
    totalAmount: 3200, paidAmount: 0, status: 'unpaid', createdAt: '2026-01-28T09:15:00Z', dueDate: '2026-02-28T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv4', invoiceNo: 'INV-2026-004', customerId: 'c4', customerName: 'Noura Ali',
    items: [
      { productId: 'p7', productName: 'Water Softener', quantity: 1, unitPrice: 3500, total: 3500 },
    ],
    totalAmount: 3500, paidAmount: 1400, status: 'partial', createdAt: '2026-02-25T11:00:00Z', dueDate: '2026-03-25T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv5', invoiceNo: 'INV-2026-005', customerId: 'c5', customerName: 'Yasser Ibrahim',
    items: [
      { productId: 'p1', productName: 'Premium Water Filter', quantity: 3, unitPrice: 1500, total: 4500 },
      { productId: 'p8', productName: 'Pipe Connector Set', quantity: 2, unitPrice: 120, total: 240 },
    ],
    totalAmount: 4740, paidAmount: 0, status: 'unpaid', createdAt: '2026-01-10T16:00:00Z', dueDate: '2026-02-10T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv6', invoiceNo: 'INV-2026-006', customerId: 'c6', customerName: 'Dina Kamal',
    items: [
      { productId: 'p2', productName: 'Standard Water Filter', quantity: 1, unitPrice: 800, total: 800 },
    ],
    totalAmount: 800, paidAmount: 0, status: 'unpaid', createdAt: '2026-03-01T08:00:00Z', dueDate: '2026-04-01T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv7', invoiceNo: 'INV-2026-007', customerId: 'c7', customerName: 'Hossam Farid',
    items: [
      { productId: 'p7', productName: 'Water Softener', quantity: 1, unitPrice: 3500, total: 3500 },
      { productId: 'p3', productName: 'Replacement Cartridge', quantity: 1, unitPrice: 250, total: 250 },
    ],
    totalAmount: 3750, paidAmount: 0, status: 'unpaid', createdAt: '2026-02-10T13:00:00Z', dueDate: '2026-03-10T00:00:00Z',
    createdById: 'u2',
  },
  {
    id: 'inv8', invoiceNo: 'INV-2026-008', customerId: 'c8', customerName: 'Laila Mahmoud',
    items: [
      { productId: 'p5', productName: 'Water Purifier Tablet', quantity: 5, unitPrice: 50, total: 250 },
    ],
    totalAmount: 250, paidAmount: 250, status: 'paid', createdAt: '2026-02-28T10:00:00Z', dueDate: '2026-03-28T00:00:00Z',
    createdById: 'u2',
  },
];

export const mockPayments = [
  { id: 'pay1', invoiceId: 'inv1', customerId: 'c1', customerName: 'Mohamed Hassan', collectorId: 'u3', collectorName: 'Omar Collector', amount: 50, method: 'cash' as const, status: 'verified' as const, createdAt: '2026-02-22T10:30:00Z' },
  { id: 'pay2', invoiceId: 'inv4', customerId: 'c4', customerName: 'Noura Ali', collectorId: 'u6', collectorName: 'Youssef Collector', amount: 1400, method: 'fawry' as const, status: 'verified' as const, createdAt: '2026-02-27T14:00:00Z' },
  { id: 'pay3', invoiceId: 'inv8', customerId: 'c8', customerName: 'Laila Mahmoud', collectorId: 'u3', collectorName: 'Omar Collector', amount: 250, method: 'cash' as const, status: 'deposited' as const, createdAt: '2026-02-28T11:00:00Z' },
  { id: 'pay4', invoiceId: 'inv2', customerId: 'c2', customerName: 'Amira Saeed', collectorId: 'u3', collectorName: 'Omar Collector', amount: 500, method: 'cash' as const, status: 'pending' as const, createdAt: '2026-03-03T09:00:00Z' },
  { id: 'pay5', invoiceId: 'inv5', customerId: 'c5', customerName: 'Yasser Ibrahim', collectorId: 'u6', collectorName: 'Youssef Collector', amount: 2000, method: 'fawry' as const, status: 'pending' as const, createdAt: '2026-03-03T15:00:00Z' },
];

export const mockDeposits = [
  { id: 'd1', collectorId: 'u3', collectorName: 'Omar Collector', amount: 250, method: 'cash' as const, status: 'verified' as const, receiptImage: undefined, createdAt: '2026-03-01T12:00:00Z' },
  { id: 'd2', collectorId: 'u6', collectorName: 'Youssef Collector', amount: 1400, method: 'fawry' as const, status: 'pending' as const, receiptImage: undefined, createdAt: '2026-03-02T16:00:00Z' },
  { id: 'd3', collectorId: 'u3', collectorName: 'Omar Collector', amount: 300, method: 'cash' as const, status: 'pending' as const, receiptImage: undefined, createdAt: '2026-03-03T10:00:00Z' },
];

export const mockComplaints = [
  { id: 'comp1', title: 'Wrong invoice amount', description: 'Invoice INV-2026-003 has wrong product price listed', status: 'PENDING', priority: 'HIGH', response: null, resolvedAt: null, createdAt: '2026-03-02T08:00:00Z', user: { id: 'u3', name: 'Omar Collector', email: 'collector@demo.com', role: 'COLLECTOR' } },
  { id: 'comp2', title: 'Customer address outdated', description: 'Customer Noura Ali has moved to a new address', status: 'IN_REVIEW', priority: 'MEDIUM', response: null, resolvedAt: null, createdAt: '2026-02-28T14:00:00Z', user: { id: 'u6', name: 'Youssef Collector', email: 'collector2@demo.com', role: 'COLLECTOR' } },
  { id: 'comp3', title: 'Payment verification delay', description: 'Payment pay2 has been pending for 3 days', status: 'RESOLVED', priority: 'LOW', response: 'Payment has been verified. Apologies for the delay.', resolvedAt: '2026-03-01T10:00:00Z', createdAt: '2026-02-25T09:00:00Z', user: { id: 'u6', name: 'Youssef Collector', email: 'collector2@demo.com', role: 'COLLECTOR' } },
];

// Dashboard data
export const mockDashboard = {
  todayCollected: 2500,
  todayPayments: 3,
  totalOutstanding: 21600,
  pendingVerifications: 2,
  activeCollectors: 2,
  totalCustomers: 8,
};

// Collections report
export const mockCollectionsReport = {
  summary: {
    totalCollected: 4200,
    totalCash: 800,
    totalFawry: 3400,
    totalPayments: 5,
  },
  byCollector: [
    { collectorId: 'u3', collectorName: 'Omar Collector', totalCollected: 800, cashAmount: 800, fawryAmount: 0, paymentCount: 3 },
    { collectorId: 'u6', collectorName: 'Youssef Collector', totalCollected: 3400, cashAmount: 0, fawryAmount: 3400, paymentCount: 2 },
  ],
};

// Outstanding report
export const mockOutstandingReport = {
  summary: {
    totalOutstanding: 21600,
    overdueAmount: 7940,
    totalInvoices: 7,
    overdueInvoices: 2,
  },
  byCustomer: [
    { customerId: 'c5', customerName: 'Yasser Ibrahim', customerPhone: '01567891234', collectorId: 'u6', collectorName: 'Youssef Collector', totalOutstanding: 4740, invoiceCount: 1, oldestDueDate: '2026-02-10T00:00:00Z' },
    { customerId: 'c3', customerName: 'Tarek Mostafa', customerPhone: '01155566677', collectorId: 'u3', collectorName: 'Omar Collector', totalOutstanding: 3200, invoiceCount: 1, oldestDueDate: '2026-02-28T00:00:00Z' },
    { customerId: 'c7', customerName: 'Hossam Farid', customerPhone: '01099887766', collectorId: 'u6', collectorName: 'Youssef Collector', totalOutstanding: 3750, invoiceCount: 1, oldestDueDate: '2026-03-10T00:00:00Z' },
    { customerId: 'c1', customerName: 'Mohamed Hassan', customerPhone: '01012345678', collectorId: 'u3', collectorName: 'Omar Collector', totalOutstanding: 3200, invoiceCount: 1, oldestDueDate: '2026-03-20T00:00:00Z' },
    { customerId: 'c4', customerName: 'Noura Ali', customerPhone: '01234567890', collectorId: 'u6', collectorName: 'Youssef Collector', totalOutstanding: 2100, invoiceCount: 1, oldestDueDate: '2026-03-25T00:00:00Z' },
    { customerId: 'c2', customerName: 'Amira Saeed', customerPhone: '01098765432', collectorId: 'u3', collectorName: 'Omar Collector', totalOutstanding: 1150, invoiceCount: 1, oldestDueDate: '2026-03-15T00:00:00Z' },
    { customerId: 'c6', customerName: 'Dina Kamal', customerPhone: '01111222333', collectorId: 'u3', collectorName: 'Omar Collector', totalOutstanding: 800, invoiceCount: 1, oldestDueDate: '2026-04-01T00:00:00Z' },
  ],
};

// Performance report
export const mockPerformanceReport = {
  summary: {
    totalCollectors: 2,
    totalCollected: 4200,
    averageVisitRate: 62.5,
  },
  collectors: [
    { collectorId: 'u3', collectorName: 'Omar Collector', totalCollected: 800, paymentCount: 3, customerCount: 5, totalVisits: 5, completedVisits: 4, visitRate: 80, rank: 1 },
    { collectorId: 'u6', collectorName: 'Youssef Collector', totalCollected: 3400, paymentCount: 2, customerCount: 3, totalVisits: 3, completedVisits: 1, visitRate: 33, rank: 2 },
  ],
};

// Collector-specific data (for collector u3 - Omar)
export const mockCollectorStats = {
  collectorId: 'u3',
  collectorName: 'Omar Collector',
  totalCollected: 800,
  cashAmount: 800,
  fawryAmount: 0,
  walletBalance: 550,
  customersVisited: 4,
  totalCustomers: 5,
};

export const mockCollectorRoute = [
  { customerId: 'c1', customerName: 'Mohamed Hassan', address: '15 Tahrir St, Cairo', phone: '01012345678', outstandingAmount: 3200, visited: true, order: 1, latitude: 30.0444, longitude: 31.2357 },
  { customerId: 'c2', customerName: 'Amira Saeed', address: '22 Nile Ave, Giza', phone: '01098765432', outstandingAmount: 1150, visited: true, order: 2, latitude: 30.0131, longitude: 31.2089 },
  { customerId: 'c6', customerName: 'Dina Kamal', address: '33 Zamalek, Cairo', phone: '01111222333', outstandingAmount: 800, visited: false, order: 3, latitude: 30.0626, longitude: 31.2196 },
  { customerId: 'c3', customerName: 'Tarek Mostafa', address: '8 October St, 6th October', phone: '01155566677', outstandingAmount: 3200, visited: false, order: 4, latitude: 29.9728, longitude: 30.9429 },
  { customerId: 'c8', customerName: 'Laila Mahmoud', address: '17 Nasr City, Cairo', phone: '01288776655', outstandingAmount: 0, visited: true, order: 5, latitude: 30.0511, longitude: 31.3456 },
];

export const mockComplaintStats = {
  total: 3,
  pending: 1,
  inReview: 1,
  resolved: 1,
  rejected: 0,
};

export const mockAdminWalletTransactions = [
  { id: 'awt1', depositId: 'd1', collectorName: 'Omar Collector', amount: 250, createdAt: '2026-03-01T12:00:00Z' },
];
