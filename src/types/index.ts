export type UserRole = 'sales_clerk' | 'collector' | 'accountant' | 'sales_manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  collectorId: string;
  totalOutstanding: number;
  lastPurchaseDate?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  createdAt: string;
  dueDate: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  collectorId: string;
  amount: number;
  method: 'cash' | 'fawry';
  receiptImage?: string;
  status: 'pending' | 'verified' | 'deposited';
  createdAt: string;
}

export interface Deposit {
  id: string;
  collectorId: string;
  amount: number;
  method: 'cash' | 'fawry';
  receiptImage?: string;
  status: 'pending' | 'verified';
  createdAt: string;
}

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

export interface DailyRoute {
  customerId: string;
  customerName: string;
  address: string;
  phone: string;
  outstandingAmount: number;
  visited: boolean;
  order: number;
}
