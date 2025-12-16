import { Customer, Invoice, CollectorStats, DailyRoute, Product, Payment } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Coca Cola 1L', price: 15, unit: 'bottle', category: 'Beverages' },
  { id: '2', name: 'Pepsi 1L', price: 14, unit: 'bottle', category: 'Beverages' },
  { id: '3', name: 'Chips Ahoy', price: 25, unit: 'pack', category: 'Snacks' },
  { id: '4', name: 'Lay\'s Classic', price: 18, unit: 'pack', category: 'Snacks' },
  { id: '5', name: 'Nescafe 50g', price: 45, unit: 'jar', category: 'Coffee' },
  { id: '6', name: 'Lipton Tea 25s', price: 35, unit: 'box', category: 'Tea' },
  { id: '7', name: 'Dove Soap', price: 22, unit: 'piece', category: 'Personal Care' },
  { id: '8', name: 'Tide Detergent 1kg', price: 65, unit: 'pack', category: 'Cleaning' },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Al-Nour Supermarket', phone: '01012345678', address: '15 Main St, Cairo', collectorId: '2', totalOutstanding: 2500, lastPurchaseDate: '2024-01-14' },
  { id: '2', name: 'El-Salam Grocery', phone: '01023456789', address: '22 Market Ave, Giza', collectorId: '2', totalOutstanding: 1800, lastPurchaseDate: '2024-01-13' },
  { id: '3', name: 'Baraka Mini Market', phone: '01034567890', address: '8 Commerce Blvd, Cairo', collectorId: '2', totalOutstanding: 3200, lastPurchaseDate: '2024-01-15' },
  { id: '4', name: 'Zahra Corner Store', phone: '01045678901', address: '45 Side St, Alexandria', collectorId: '2', totalOutstanding: 950, lastPurchaseDate: '2024-01-10' },
  { id: '5', name: 'Masr Wholesale', phone: '01056789012', address: '100 Industrial Zone, Cairo', collectorId: '2', totalOutstanding: 5600, lastPurchaseDate: '2024-01-14' },
  { id: '6', name: 'Delta Supplies', phone: '01067890123', address: '33 River Rd, Tanta', collectorId: '3', totalOutstanding: 4200, lastPurchaseDate: '2024-01-12' },
  { id: '7', name: 'Nile Market', phone: '01078901234', address: '77 Nile St, Aswan', collectorId: '3', totalOutstanding: 1500, lastPurchaseDate: '2024-01-11' },
  { id: '8', name: 'Pharaoh Foods', phone: '01089012345', address: '12 Pyramid Ave, Giza', collectorId: '3', totalOutstanding: 2800, lastPurchaseDate: '2024-01-13' },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    customerId: '1',
    customerName: 'Al-Nour Supermarket',
    items: [
      { productId: '1', productName: 'Coca Cola 1L', quantity: 48, unitPrice: 15, total: 720 },
      { productId: '3', productName: 'Chips Ahoy', quantity: 24, unitPrice: 25, total: 600 },
    ],
    totalAmount: 1320,
    paidAmount: 500,
    status: 'partial',
    createdAt: '2024-01-10',
    dueDate: '2024-01-25',
  },
  {
    id: 'INV-002',
    customerId: '1',
    customerName: 'Al-Nour Supermarket',
    items: [
      { productId: '5', productName: 'Nescafe 50g', quantity: 20, unitPrice: 45, total: 900 },
    ],
    totalAmount: 900,
    paidAmount: 0,
    status: 'unpaid',
    createdAt: '2024-01-14',
    dueDate: '2024-01-29',
  },
  {
    id: 'INV-003',
    customerId: '2',
    customerName: 'El-Salam Grocery',
    items: [
      { productId: '2', productName: 'Pepsi 1L', quantity: 60, unitPrice: 14, total: 840 },
      { productId: '4', productName: 'Lay\'s Classic', quantity: 36, unitPrice: 18, total: 648 },
    ],
    totalAmount: 1488,
    paidAmount: 1488,
    status: 'paid',
    createdAt: '2024-01-08',
    dueDate: '2024-01-23',
  },
  {
    id: 'INV-004',
    customerId: '3',
    customerName: 'Baraka Mini Market',
    items: [
      { productId: '7', productName: 'Dove Soap', quantity: 100, unitPrice: 22, total: 2200 },
      { productId: '8', productName: 'Tide Detergent 1kg', quantity: 30, unitPrice: 65, total: 1950 },
    ],
    totalAmount: 4150,
    paidAmount: 950,
    status: 'partial',
    createdAt: '2024-01-12',
    dueDate: '2024-01-27',
  },
  {
    id: 'INV-005',
    customerId: '5',
    customerName: 'Masr Wholesale',
    items: [
      { productId: '1', productName: 'Coca Cola 1L', quantity: 200, unitPrice: 15, total: 3000 },
      { productId: '2', productName: 'Pepsi 1L', quantity: 200, unitPrice: 14, total: 2800 },
    ],
    totalAmount: 5800,
    paidAmount: 200,
    status: 'partial',
    createdAt: '2024-01-14',
    dueDate: '2024-01-29',
  },
];

export const mockPayments: Payment[] = [
  { id: 'PAY-001', invoiceId: 'INV-001', customerId: '1', collectorId: '2', amount: 500, method: 'cash', status: 'deposited', createdAt: '2024-01-12' },
  { id: 'PAY-002', invoiceId: 'INV-003', customerId: '2', collectorId: '2', amount: 1488, method: 'fawry', receiptImage: '/receipt.jpg', status: 'verified', createdAt: '2024-01-10' },
  { id: 'PAY-003', invoiceId: 'INV-004', customerId: '3', collectorId: '2', amount: 950, method: 'cash', status: 'pending', createdAt: '2024-01-14' },
  { id: 'PAY-004', invoiceId: 'INV-005', customerId: '5', collectorId: '2', amount: 200, method: 'fawry', receiptImage: '/receipt2.jpg', status: 'pending', createdAt: '2024-01-15' },
];

export const mockCollectorStats: CollectorStats[] = [
  { collectorId: '2', collectorName: 'Mohamed Ali', totalCollected: 8500, cashAmount: 5200, fawryAmount: 3300, walletBalance: 1150, customersVisited: 32, totalCustomers: 40 },
  { collectorId: '3', collectorName: 'Ahmed Mahmoud', totalCollected: 6200, cashAmount: 4100, fawryAmount: 2100, walletBalance: 850, customersVisited: 28, totalCustomers: 40 },
  { collectorId: '4', collectorName: 'Hassan Omar', totalCollected: 7800, cashAmount: 3900, fawryAmount: 3900, walletBalance: 1400, customersVisited: 35, totalCustomers: 40 },
  { collectorId: '5', collectorName: 'Youssef Karim', totalCollected: 5500, cashAmount: 3200, fawryAmount: 2300, walletBalance: 600, customersVisited: 25, totalCustomers: 40 },
  { collectorId: '6', collectorName: 'Tarek Nabil', totalCollected: 9200, cashAmount: 5800, fawryAmount: 3400, walletBalance: 1800, customersVisited: 38, totalCustomers: 40 },
];

export const mockDailyRoute: DailyRoute[] = [
  { customerId: '1', customerName: 'Al-Nour Supermarket', address: '15 Main St, Cairo', phone: '01012345678', outstandingAmount: 2500, visited: true, order: 1 },
  { customerId: '2', customerName: 'El-Salam Grocery', address: '22 Market Ave, Giza', phone: '01023456789', outstandingAmount: 1800, visited: true, order: 2 },
  { customerId: '3', customerName: 'Baraka Mini Market', address: '8 Commerce Blvd, Cairo', phone: '01034567890', outstandingAmount: 3200, visited: false, order: 3 },
  { customerId: '4', customerName: 'Zahra Corner Store', address: '45 Side St, Alexandria', phone: '01045678901', outstandingAmount: 950, visited: false, order: 4 },
  { customerId: '5', customerName: 'Masr Wholesale', address: '100 Industrial Zone, Cairo', phone: '01056789012', outstandingAmount: 5600, visited: false, order: 5 },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
