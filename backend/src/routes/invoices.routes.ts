import { Router } from 'express';
import { invoicesController } from '../controllers/invoices.controller';
import { validateBody, validateParams } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { uploadInvoice } from '../middleware/upload';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceIdSchema,
} from '../schemas/invoice.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all invoices
router.get('/', invoicesController.findAll);

// Get outstanding invoices
router.get('/outstanding', invoicesController.getOutstanding);

// Get invoices by customer
router.get('/customer/:customerId', invoicesController.findByCustomer);

// Get single invoice
router.get('/:id', validateParams(invoiceIdSchema), invoicesController.findById);

// Sales Clerk and Admin routes
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.SALES_CLERK),
  validateBody(createInvoiceSchema),
  invoicesController.create
);

// Upload Excel file
router.post(
  '/upload',
  authorize(UserRole.ADMIN, UserRole.SALES_CLERK),
  uploadInvoice.single('file'),
  invoicesController.uploadExcel
);

// Create invoices from parsed Excel data
router.post(
  '/upload/confirm',
  authorize(UserRole.ADMIN, UserRole.SALES_CLERK),
  invoicesController.createFromExcel
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.SALES_CLERK),
  validateParams(invoiceIdSchema),
  validateBody(updateInvoiceSchema),
  invoicesController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateParams(invoiceIdSchema),
  invoicesController.delete
);

export default router;
