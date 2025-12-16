import { PrismaClient, UserRole, InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.collectorVisit.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await hashPassword('demo123');

  const salesClerk = await prisma.user.create({
    data: {
      email: 'clerk@demo.com',
      password: hashedPassword,
      name: 'Ahmed Hassan',
      role: UserRole.SALES_CLERK,
    },
  });

  const collector1 = await prisma.user.create({
    data: {
      email: 'collector@demo.com',
      password: hashedPassword,
      name: 'Mohamed Ali',
      role: UserRole.COLLECTOR,
    },
  });

  const collector2 = await prisma.user.create({
    data: {
      email: 'collector2@demo.com',
      password: hashedPassword,
      name: 'Ahmed Mahmoud',
      role: UserRole.COLLECTOR,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@demo.com',
      password: hashedPassword,
      name: 'Sara Ahmed',
      role: UserRole.ACCOUNTANT,
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      email: 'manager@demo.com',
      password: hashedPassword,
      name: 'Khaled Ibrahim',
      role: UserRole.SALES_MANAGER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Created 6 users');

  // Create products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: { name: 'Coca Cola 1L', price: 15, unit: 'bottle', category: 'Beverages' },
    }),
    prisma.product.create({
      data: { name: 'Pepsi 1L', price: 14, unit: 'bottle', category: 'Beverages' },
    }),
    prisma.product.create({
      data: { name: 'Chips Ahoy', price: 25, unit: 'pack', category: 'Snacks' },
    }),
    prisma.product.create({
      data: { name: "Lay's Classic", price: 18, unit: 'pack', category: 'Snacks' },
    }),
    prisma.product.create({
      data: { name: 'Nescafe 50g', price: 45, unit: 'jar', category: 'Coffee' },
    }),
    prisma.product.create({
      data: { name: 'Lipton Tea 25s', price: 35, unit: 'box', category: 'Tea' },
    }),
    prisma.product.create({
      data: { name: 'Dove Soap', price: 22, unit: 'piece', category: 'Personal Care' },
    }),
    prisma.product.create({
      data: { name: 'Tide Detergent 1kg', price: 65, unit: 'pack', category: 'Cleaning' },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create customers
  console.log('🏪 Creating customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Al-Nour Supermarket',
        phone: '01012345678',
        address: '15 Main St, Cairo',
        collectorId: collector1.id,
        totalOutstanding: 2500,
        lastPurchaseDate: new Date('2024-01-14'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'El-Salam Grocery',
        phone: '01023456789',
        address: '22 Market Ave, Giza',
        collectorId: collector1.id,
        totalOutstanding: 1800,
        lastPurchaseDate: new Date('2024-01-13'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Baraka Mini Market',
        phone: '01034567890',
        address: '8 Commerce Blvd, Cairo',
        collectorId: collector1.id,
        totalOutstanding: 3200,
        lastPurchaseDate: new Date('2024-01-15'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Zahra Corner Store',
        phone: '01045678901',
        address: '45 Side St, Alexandria',
        collectorId: collector1.id,
        totalOutstanding: 950,
        lastPurchaseDate: new Date('2024-01-10'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Masr Wholesale',
        phone: '01056789012',
        address: '100 Industrial Zone, Cairo',
        collectorId: collector1.id,
        totalOutstanding: 5600,
        lastPurchaseDate: new Date('2024-01-14'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Delta Supplies',
        phone: '01067890123',
        address: '33 River Rd, Tanta',
        collectorId: collector2.id,
        totalOutstanding: 4200,
        lastPurchaseDate: new Date('2024-01-12'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Nile Market',
        phone: '01078901234',
        address: '77 Nile St, Aswan',
        collectorId: collector2.id,
        totalOutstanding: 1500,
        lastPurchaseDate: new Date('2024-01-11'),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Pharaoh Foods',
        phone: '01089012345',
        address: '12 Pyramid Ave, Giza',
        collectorId: collector2.id,
        totalOutstanding: 2800,
        lastPurchaseDate: new Date('2024-01-13'),
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create invoices
  console.log('📋 Creating invoices...');
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-00001',
      customerId: customers[0].id,
      createdById: salesClerk.id,
      totalAmount: 1320,
      paidAmount: 500,
      status: InvoiceStatus.PARTIAL,
      dueDate: new Date('2024-01-25'),
      items: {
        create: [
          { productId: products[0].id, quantity: 48, unitPrice: 15, total: 720 },
          { productId: products[2].id, quantity: 24, unitPrice: 25, total: 600 },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-00002',
      customerId: customers[0].id,
      createdById: salesClerk.id,
      totalAmount: 900,
      paidAmount: 0,
      status: InvoiceStatus.UNPAID,
      dueDate: new Date('2024-01-29'),
      items: {
        create: [
          { productId: products[4].id, quantity: 20, unitPrice: 45, total: 900 },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-00003',
      customerId: customers[1].id,
      createdById: salesClerk.id,
      totalAmount: 1488,
      paidAmount: 1488,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2024-01-23'),
      items: {
        create: [
          { productId: products[1].id, quantity: 60, unitPrice: 14, total: 840 },
          { productId: products[3].id, quantity: 36, unitPrice: 18, total: 648 },
        ],
      },
    },
  });

  const invoice4 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-00004',
      customerId: customers[2].id,
      createdById: salesClerk.id,
      totalAmount: 4150,
      paidAmount: 950,
      status: InvoiceStatus.PARTIAL,
      dueDate: new Date('2024-01-27'),
      items: {
        create: [
          { productId: products[6].id, quantity: 100, unitPrice: 22, total: 2200 },
          { productId: products[7].id, quantity: 30, unitPrice: 65, total: 1950 },
        ],
      },
    },
  });

  const invoice5 = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-00005',
      customerId: customers[4].id,
      createdById: salesClerk.id,
      totalAmount: 5800,
      paidAmount: 200,
      status: InvoiceStatus.PARTIAL,
      dueDate: new Date('2024-01-29'),
      items: {
        create: [
          { productId: products[0].id, quantity: 200, unitPrice: 15, total: 3000 },
          { productId: products[1].id, quantity: 200, unitPrice: 14, total: 2800 },
        ],
      },
    },
  });

  console.log('✅ Created 5 invoices');

  // Create payments
  console.log('💰 Creating payments...');
  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      customerId: customers[0].id,
      collectorId: collector1.id,
      amount: 500,
      method: PaymentMethod.CASH,
      status: PaymentStatus.DEPOSITED,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice3.id,
      customerId: customers[1].id,
      collectorId: collector1.id,
      amount: 1488,
      method: PaymentMethod.FAWRY,
      status: PaymentStatus.VERIFIED,
      receiptImage: '/uploads/receipts/receipt1.jpg',
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice4.id,
      customerId: customers[2].id,
      collectorId: collector1.id,
      amount: 950,
      method: PaymentMethod.CASH,
      status: PaymentStatus.PENDING,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice5.id,
      customerId: customers[4].id,
      collectorId: collector1.id,
      amount: 200,
      method: PaymentMethod.FAWRY,
      status: PaymentStatus.PENDING,
      receiptImage: '/uploads/receipts/receipt2.jpg',
    },
  });

  console.log('✅ Created 4 payments');

  // Create collector visits for today
  console.log('🗺️ Creating daily route...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    await prisma.collectorVisit.create({
      data: {
        collectorId: collector1.id,
        customerId: customers[i].id,
        visitDate: today,
        visitOrder: i + 1,
        visited: i < 2, // First 2 visited
        visitedAt: i < 2 ? new Date() : null,
      },
    });
  }

  console.log('✅ Created daily route for collector');

  // Create a deposit
  console.log('🏦 Creating deposits...');
  await prisma.deposit.create({
    data: {
      collectorId: collector1.id,
      amount: 500,
      method: PaymentMethod.CASH,
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created 1 deposit');

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Demo accounts:');
  console.log('   Sales Clerk:    clerk@demo.com / demo123');
  console.log('   Collector:      collector@demo.com / demo123');
  console.log('   Accountant:     accountant@demo.com / demo123');
  console.log('   Sales Manager:  manager@demo.com / demo123');
  console.log('   Admin:          admin@demo.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
