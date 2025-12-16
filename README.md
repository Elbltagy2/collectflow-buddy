# CollectFlow Buddy

A comprehensive invoice collection management system for businesses to track invoices, manage collectors, and monitor payments.

## Features

### Role-Based Access
- **Admin**: Full system access - manage users, products, customers, upload invoices
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

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Query for data fetching
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Multer for file uploads
- xlsx for Excel parsing

## Getting Started

### Prerequisites
- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

### Running the Application

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

### Demo Accounts

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Sales Clerk | clerk@example.com | password123 |
| Collector | collector@example.com | password123 |
| Accountant | accountant@example.com | password123 |
| Sales Manager | manager@example.com | password123 |

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
│   │   ├── manager/
│   │   └── sales-clerk/
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
│   └── uploads/             # Uploaded files (receipts, invoices)
└── public/                   # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/upload` - Upload Excel file
- `POST /api/invoices/upload/confirm` - Confirm Excel import

### Collector
- `GET /api/collector/route` - Get today's route
- `GET /api/collector/stats` - Get collector stats
- `GET /api/collector/wallet` - Get wallet balance
- `POST /api/collector/visit/:customerId` - Mark customer visited

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

### Deposits
- `GET /api/deposits` - List deposits
- `POST /api/deposits` - Create deposit
- `POST /api/deposits/:id/receipt` - Upload receipt

## Excel Invoice Format

When uploading invoices via Excel, use these column headers:
- `customer_name` or `customerName` or `Customer`
- `product_name` or `productName` or `Product`
- `quantity` or `Quantity`
- `unit_price` or `unitPrice` or `Price` (optional - uses product price if not provided)

Example:
| customer_name | product_name | quantity | unit_price |
|--------------|--------------|----------|------------|
| Ahmed Store | Product A | 10 | 100 |
| Mohamed Shop | Product B | 5 | 200 |

## How Routes Work

1. When an invoice is created (manually or via Excel upload), the system checks the due date
2. If the customer has an assigned collector, a `CollectorVisit` entry is created for that due date
3. The collector sees customers with due/overdue invoices in their "Today's Route"
4. When recording a payment, the collector selects the specific invoice
5. After payment, the customer is marked as "visited" for the day
6. If a new invoice is added for an already-visited customer, their status resets to "not visited"

## License

MIT
