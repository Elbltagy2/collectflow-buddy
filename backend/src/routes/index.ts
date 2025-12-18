import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import productsRoutes from './products.routes';
import customersRoutes from './customers.routes';
import invoicesRoutes from './invoices.routes';
import paymentsRoutes from './payments.routes';
import depositsRoutes from './deposits.routes';
import collectorRoutes from './collector.routes';
import reportsRoutes from './reports.routes';
import complaintRoutes from './complaint.routes';
import routeOptimizationRoutes from './route-optimization.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/customers', customersRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/deposits', depositsRoutes);
router.use('/collector', collectorRoutes);
router.use('/reports', reportsRoutes);
router.use('/complaints', complaintRoutes);
router.use('/route-optimization', routeOptimizationRoutes);

export default router;
