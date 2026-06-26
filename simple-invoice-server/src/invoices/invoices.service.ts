import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { ListInvoicesDto } from './dto/list-invoices.dto.js';
import { InvoiceStatus } from '../../generated/prisma/enums.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  calculateAmounts(
    quantity: number,
    rate: number,
    taxPercent: number,
    discount: number,
  ) {
    const subTotal = quantity * rate;
    const taxAmount = subTotal * (taxPercent / 100);
    const totalAmount = subTotal + taxAmount - discount;
    return { subTotal, taxAmount, totalAmount };
  }

  deriveStatus(status: InvoiceStatus, dueDate: Date): string {
    if (status !== InvoiceStatus.Paid) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today) {
        return 'Overdue';
      }
    }
    return status;
  }

  async create(dto: CreateInvoiceDto, userId: string) {
    const invoiceDate = new Date(dto.invoiceDate);
    const dueDate = new Date(dto.dueDate);

    if (dueDate < invoiceDate) {
      throw new BadRequestException('dueDate must be on or after invoiceDate');
    }

    const existing = await this.prisma.invoice.findUnique({
      where: { invoiceNumber: dto.invoiceNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Invoice number '${dto.invoiceNumber}' already exists`,
      );
    }

    const taxPercent = dto.taxPercent ?? 10;
    const discount = dto.discount ?? 0;
    const { subTotal, taxAmount, totalAmount } = this.calculateAmounts(
      dto.item.quantity,
      dto.item.rate,
      taxPercent,
      discount,
    );
    const balanceAmount = totalAmount; // totalPaid = 0 on creation

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: dto.invoiceNumber,
        invoiceReference: dto.invoiceReference,
        invoiceDate,
        dueDate,
        currency: dto.currency,
        currencySymbol: dto.currencySymbol,
        description: dto.description,
        status: InvoiceStatus.Draft,
        invoiceSubTotal: new Prisma.Decimal(subTotal),
        totalTax: new Prisma.Decimal(taxAmount),
        totalDiscount: new Prisma.Decimal(discount),
        totalAmount: new Prisma.Decimal(totalAmount),
        totalPaid: new Prisma.Decimal(0),
        balanceAmount: new Prisma.Decimal(balanceAmount),
        customerFullname: dto.customerFullname,
        customerEmail: dto.customerEmail,
        customerMobile: dto.customerMobile,
        customerAddress: dto.customerAddress,
        createdBy: userId,
        items: {
          create: {
            name: dto.item.name,
            quantity: dto.item.quantity,
            rate: new Prisma.Decimal(dto.item.rate),
          },
        },
      },
      include: { items: true },
    });

    return this.formatInvoice(invoice);
  }

  async findAll(query: ListInvoicesDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, query.pageSize ?? 10));
    const skip = (page - 1) * pageSize;

    const where: Prisma.InvoiceWhereInput = {};

    if (query.keyword) {
      where.OR = [
        { invoiceNumber: { contains: query.keyword, mode: 'insensitive' } },
        { customerFullname: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    if (query.fromDate) {
      where.invoiceDate = {
        ...((where.invoiceDate as object) ?? {}),
        gte: new Date(query.fromDate),
      };
    }
    if (query.toDate) {
      where.invoiceDate = {
        ...((where.invoiceDate as object) ?? {}),
        lte: new Date(query.toDate),
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (query.status === 'Overdue') {
      where.status = { not: InvoiceStatus.Paid };
      where.dueDate = { lt: today };
    } else if (query.status && query.status !== 'Overdue') {
      where.status = query.status as InvoiceStatus;
      if (query.status !== 'Paid') {
        where.NOT = { dueDate: { lt: today } };
      }
    }

    const sortField = query.sortBy ?? 'invoiceDate';
    const sortDir = (query.ordering ?? 'DESC').toLowerCase() as 'asc' | 'desc';
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {
      [sortField]: sortDir,
    };

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: { items: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map((inv) => this.formatInvoice(inv)),
      paging: { page, pageSize, total },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceId: id },
      include: { items: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.formatInvoice(invoice);
  }

  private formatInvoice(invoice: any) {
    return {
      ...invoice,
      status: this.deriveStatus(invoice.status, invoice.dueDate),
      invoiceSubTotal: Number(invoice.invoiceSubTotal),
      totalTax: Number(invoice.totalTax),
      totalDiscount: Number(invoice.totalDiscount),
      totalAmount: Number(invoice.totalAmount),
      totalPaid: Number(invoice.totalPaid),
      balanceAmount: Number(invoice.balanceAmount),
      items: invoice.items.map((item: any) => ({
        ...item,
        rate: Number(item.rate),
      })),
    };
  }
}
