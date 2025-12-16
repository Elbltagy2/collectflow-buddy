import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { AppError } from './errorHandler';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(config.upload.receiptsDir);
ensureDirectoryExists(config.upload.invoicesDir);

// Storage configuration for receipts
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.receiptsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  },
});

// Storage configuration for invoices (Excel files)
const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.invoicesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `invoice-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const imageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, GIF, WebP) are allowed', 400));
  }
};

// File filter for Excel files
const excelFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv', // csv
  ];
  const allowedExts = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only Excel files (XLSX, XLS) and CSV files are allowed', 400));
  }
};

// Multer configurations
export const uploadReceipt = multer({
  storage: receiptStorage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: imageFilter,
});

export const uploadInvoice = multer({
  storage: invoiceStorage,
  limits: {
    fileSize: config.upload.maxFileSize * 2, // Allow larger files for Excel
  },
  fileFilter: excelFilter,
});

// Helper to get file URL
export const getFileUrl = (filename: string, type: 'receipts' | 'invoices'): string => {
  return `/uploads/${type}/${filename}`;
};

// Helper to delete file
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
