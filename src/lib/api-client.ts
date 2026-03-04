// Barrel module that switches between real and mock API based on VITE_USE_MOCK env variable
import * as realApi from './api';
import * as mockApi from './mock-api';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const api = useMock ? mockApi : realApi;

export const {
  setTokens,
  clearTokens,
  getAccessToken,
  authApi,
  usersApi,
  productsApi,
  customersApi,
  invoicesApi,
  paymentsApi,
  depositsApi,
  collectorApi,
  reportsApi,
  complaintsApi,
  routeOptimizationApi,
} = api;
