# CollectFlow Buddy

A comprehensive invoice collection management system for businesses to track invoices, manage collectors, and monitor payments.

## Live Demo

- **Frontend**: [Vercel Deployment](https://collectflow-buddy.vercel.app)
- **Backend**: [Railway Deployment](https://collectflow-buddy-production.up.railway.app)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Sales Clerk | clerk@demo.com | demo123 |
| Collector | collector@demo.com | demo123 |
| Accountant | accountant@demo.com | demo123 |
| Sales Manager | manager@demo.com | demo123 |

## Features

### Role-Based Access
- **Admin**: Full system access - manage users, products, customers, upload invoices, approve deposits
- **Sales Clerk**: Upload invoices via Excel, create manual invoices, search invoices
- **Collector**: View assigned customers, daily routes, record payments, manage wallet, make deposits
- **Accountant**: Verify receipts, view outstanding reports, export reports
- **Sales Manager**: Manage customers, set monthly targets, view performance metrics

### Core Functionality
- **Invoice Management**: Upload invoices via Excel or create manually with due dates
- **Automatic Route Generation**: Routes are auto-created based on invoice due dates
- **Payment Collection**: Collectors record payments against specific invoices
- **Wallet Management**: Track collected amounts before deposit
- **Deposit Tracking**: Upload receipt images for verification
- **Mobile Responsive**: Fully responsive design for field collectors

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- Sonner for toast notifications

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication (access + refresh tokens)
- Multer for file uploads
- xlsx for Excel parsing
- Zod for validation

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Elbltagy2/collectflow-buddy.git
cd collectflow-buddy
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
```bash
# In /backend, create .env file
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/collectflow?schema=public"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

5. Set up the database:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### Running Locally

**Start the backend server:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:3001

**Start the frontend:**
```bash
# From root directory
npm run dev
```
Frontend runs on http://localhost:8080

## Deployment

### Backend (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database
3. Connect your GitHub repository
4. Set the root directory to `/backend`
5. Add environment variables:
   - `DATABASE_URL` (from Railway PostgreSQL)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set environment variable:
   - `VITE_API_URL=https://your-railway-url.up.railway.app/api`
3. Deploy

## Project Structure

```
collectflow-buddy/
├── src/                      # Frontend source
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts (Auth)
│   ├── lib/                 # Utilities and API client
│   ├── pages/               # Page components by role
│   │   ├── admin/
│   │   ├── collector/
│   │   ├── accountant/
│   │   ├── manager/
│   │   ├── sales-clerk/
│   │   └── dashboards/
│   └── App.tsx              # Main app with routes
├── backend/                  # Backend source
│   ├── prisma/              # Database schema and migrations
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/          # Database and app config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, upload
│   │   ├── routes/          # API route definitions
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── services/        # Business logic
│   │   └── types/           # TypeScript types
│   ├── uploads/             # Uploaded files (receipts)
│   └── Dockerfile           # Docker config for Railway
└── public/                   # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id/assign` - Assign collector

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/upload` - Upload Excel file
- `POST /api/invoices/upload/confirm` - Confirm Excel import

### Collector
- `GET /api/collector/route` - Get today's route
- `GET /api/collector/stats` - Get collector stats
- `GET /api/collector/wallet` - Get wallet balance
- `PUT /api/collector/route/:customerId/visited` - Mark visited

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `PUT /api/payments/:id/verify` - Verify payment

### Deposits
- `GET /api/deposits` - List deposits
- `POST /api/deposits` - Create deposit
- `POST /api/deposits/:id/receipt` - Upload receipt
- `PUT /api/deposits/:id/verify` - Verify deposit

### Reports
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/collections` - Collections report
- `GET /api/reports/outstanding` - Outstanding balances
- `GET /api/reports/performance` - Collector performance

## Excel Invoice Format

When uploading invoices via Excel, use these column headers:
- `customer_name` or `customerName` or `Customer`
- `product_name` or `productName` or `Product`
- `quantity` or `Quantity`
- `unit_price` or `unitPrice` or `Price` (optional)

Example:
| customer_name | product_name | quantity | unit_price |
|--------------|--------------|----------|------------|
| Ahmed Store | Product A | 10 | 100 |
| Mohamed Shop | Product B | 5 | 200 |

## How Routes Work

1. When an invoice is created with a due date, the system checks if the customer has an assigned collector
2. A `CollectorVisit` entry is created for that collector and due date
3. The collector sees customers with due/overdue invoices in their "Today's Route"
4. When recording a payment, the collector selects the specific invoice
5. After all invoices are paid, the customer is marked as "visited"
6. Partial payments update invoice status to "PARTIAL"

## License

MIT
