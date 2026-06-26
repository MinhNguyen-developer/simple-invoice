import 'dotenv/config';
import { PrismaClient, InvoiceStatus } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<
  typeof PrismaClient
>[0]);

const currencies = [
  { code: 'AUD', symbol: 'AU$' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'EUR', symbol: '€' },
];

const customerNames = [
  'Paul Anderson',
  'Sarah Mitchell',
  'James Chen',
  'Emily Rodriguez',
  'Michael Thompson',
  'Lisa Wang',
  'David Kumar',
  'Jennifer Lee',
  'Robert Martinez',
  'Amanda Wilson',
  'Chris Taylor',
  'Nicole Brown',
  'Kevin Jackson',
  'Stephanie Davis',
  'Brian White',
  'Laura Harris',
  'Jason Clark',
  'Megan Lewis',
  'Ryan Walker',
  'Ashley Hall',
  'Matthew Young',
  'Brittany Allen',
  'Justin King',
  'Samantha Wright',
  'Andrew Scott',
  'Rachel Green',
  'Daniel Carter',
  'Melissa Adams',
];

const itemNames = [
  'Honda RC150',
  'Web Development Services',
  'UI/UX Design',
  'Cloud Infrastructure Setup',
  'Mobile App Development',
  'API Integration',
  'Database Optimization',
  'Security Audit',
  'DevOps Consulting',
  'Data Analytics Dashboard',
  'E-commerce Platform',
  'Marketing Campaign',
  'Content Strategy',
  'SEO Optimization',
  'Software License',
  'Training Workshop',
  'Technical Support',
  'System Migration',
  'Custom Software Development',
  'IT Consulting',
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startDaysAgo: number, endDaysAgo: number): Date {
  const daysAgo = randomBetween(endDaysAgo, startDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      id: 'ad1e0902-1928-4345-b513-60c86c94fc91',
      email: 'admin@simpleinvoice.com',
      passwordHash,
      fullname: 'Admin User',
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Seed invoices from Appendix A (exact mock data)
  const appendixInvoice = await prisma.invoice.create({
    data: {
      invoiceId: '099ca7da-a290-40fa-93b9-1c43ae7bb887',
      invoiceNumber: 'IV1780488206995',
      invoiceReference: '#5721662',
      invoiceDate: new Date('2026-06-03'),
      dueDate: new Date('2026-07-03'),
      currency: 'AUD',
      currencySymbol: 'AU$',
      description: 'Invoice is issued to Kanglee',
      status: InvoiceStatus.Pending, // Was "Overdue" in mock but Overdue is derived, so store as Pending with past due date
      invoiceSubTotal: 2000.0,
      totalTax: 200.0,
      totalDiscount: 20.0,
      totalAmount: 2180.0,
      totalPaid: 1451.34,
      balanceAmount: 728.66,
      customerFullname: 'Paul',
      customerEmail: 'paul@101digital.io',
      customerMobile: '947717364111',
      customerAddress: 'Singapore',
      createdBy: user.id,
      items: {
        create: {
          id: 'b1c2d3e4-0000-0000-0000-000000000001',
          name: 'Honda RC150',
          quantity: 2,
          rate: 1000,
        },
      },
    },
  });
  console.log(`✅ Seeded Appendix A invoice: ${appendixInvoice.invoiceNumber}`);

  // Generate 45 additional invoices
  const statuses = [
    InvoiceStatus.Draft,
    InvoiceStatus.Pending,
    InvoiceStatus.Paid,
  ];
  const invoiceCount = 45;

  for (let i = 0; i < invoiceCount; i++) {
    const cur = pickRandom(currencies);
    const customer = pickRandom(customerNames);
    const itemName = pickRandom(itemNames);
    const quantity = randomBetween(1, 10);
    const rate = randomBetween(100, 5000);
    const taxPercent = pickRandom([0, 5, 10, 15, 20]);
    const discount = randomBetween(0, 50);

    const subTotal = quantity * rate;
    const taxAmount = subTotal * (taxPercent / 100);
    const totalAmount = subTotal + taxAmount - discount;

    const invoiceDate = randomDate(365, 0);
    const dueDays = randomBetween(-30, 90); // negative means past due
    const dueDate = addDays(
      invoiceDate,
      Math.max(0, dueDays) + randomBetween(7, 45),
    );

    // For Paid invoices, set totalPaid = totalAmount
    const status = pickRandom(statuses);
    const totalPaid =
      status === InvoiceStatus.Paid
        ? totalAmount
        : randomBetween(0, Math.floor(totalAmount * 0.5));
    const balanceAmount = totalAmount - totalPaid;

    // Some invoices: make due date in the past but status not Paid (to have Overdue derived)
    const finalDueDate =
      i % 5 === 0 && status !== InvoiceStatus.Paid
        ? addDays(new Date(), -randomBetween(1, 60))
        : dueDate;

    const invoiceNumber = `IV${Date.now()}${i}${randomBetween(1000, 9999)}`;

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceDate,
        dueDate: finalDueDate,
        currency: cur.code,
        currencySymbol: cur.symbol,
        status,
        invoiceSubTotal: Math.round(subTotal * 100) / 100,
        totalTax: Math.round(taxAmount * 100) / 100,
        totalDiscount: discount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        balanceAmount: Math.round(balanceAmount * 100) / 100,
        customerFullname: customer,
        customerEmail: `${customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        customerMobile: `+65 ${randomBetween(8000, 9999)} ${randomBetween(1000, 9999)}`,
        customerAddress: pickRandom([
          'Singapore',
          'Sydney, Australia',
          'London, UK',
          'New York, USA',
          'Berlin, Germany',
        ]),
        createdBy: user.id,
        items: {
          create: {
            name: itemName,
            quantity,
            rate,
          },
        },
      },
    });

    if ((i + 1) % 10 === 0) {
      console.log(`✅ Seeded ${i + 1}/${invoiceCount} additional invoices...`);
    }
  }

  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Default credentials:');
  console.log('  Email:    admin@simpleinvoice.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
