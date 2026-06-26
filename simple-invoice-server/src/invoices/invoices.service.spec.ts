import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';
import { InvoiceStatus } from '../../generated/prisma/enums.js';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      invoice: {
        findUnique: (): any => null,
        create: (): any => null,
        findMany: (): any => [],
        count: (): any => 0,
      },
    };
    service = new (InvoicesService as any)(mockPrisma);
  });

  describe('calculateAmounts', () => {
    it('calculates subTotal, tax, and totalAmount correctly', () => {
      const result = service.calculateAmounts(2, 1000, 10, 20);
      expect(result.subTotal).toBe(2000);
      expect(result.taxAmount).toBe(200);
      expect(result.totalAmount).toBe(2180);
    });

    it('calculates with zero tax', () => {
      const result = service.calculateAmounts(3, 500, 0, 0);
      expect(result.subTotal).toBe(1500);
      expect(result.taxAmount).toBe(0);
      expect(result.totalAmount).toBe(1500);
    });

    it('applies discount after tax', () => {
      const result = service.calculateAmounts(1, 1000, 10, 50);
      expect(result.totalAmount).toBe(1050);
    });
  });

  describe('deriveStatus', () => {
    it('returns Overdue when status is Pending and dueDate is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(service.deriveStatus(InvoiceStatus.Pending, pastDate)).toBe(
        'Overdue',
      );
    });

    it('returns Overdue when status is Draft and dueDate is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(service.deriveStatus(InvoiceStatus.Draft, pastDate)).toBe(
        'Overdue',
      );
    });

    it('returns original status when dueDate is today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(service.deriveStatus(InvoiceStatus.Pending, today)).toBe(
        'Pending',
      );
    });

    it('returns original status when dueDate is in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(service.deriveStatus(InvoiceStatus.Draft, futureDate)).toBe(
        'Draft',
      );
    });

    it('never returns Overdue for Paid invoices', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      expect(service.deriveStatus(InvoiceStatus.Paid, pastDate)).toBe('Paid');
    });
  });

  describe('create', () => {
    const userId = 'user-123';
    const validDto: any = {
      customerFullname: 'Paul',
      customerEmail: 'paul@101digital.io',
      invoiceNumber: 'IV001',
      invoiceDate: '2026-06-01',
      dueDate: '2026-07-01',
      currency: 'AUD',
      currencySymbol: 'AU$',
      item: { name: 'Service', quantity: 2, rate: 500 },
      taxPercent: 10,
      discount: 0,
    };

    it('throws BadRequestException when dueDate is before invoiceDate', async () => {
      const dto = {
        ...validDto,
        invoiceDate: '2026-07-01',
        dueDate: '2026-06-01',
      };
      await expect(service.create(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws ConflictException when invoice number already exists', async () => {
      mockPrisma.invoice.findUnique = async () => ({ invoiceId: 'existing' });
      await expect(service.create(validDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates invoice and calls prisma.invoice.create with Draft status', async () => {
      let capturedData: any;
      mockPrisma.invoice.findUnique = async () => null;
      mockPrisma.invoice.create = async ({ data }: any) => {
        capturedData = data;
        return {
          invoiceId: 'new-id',
          invoiceNumber: 'IV001',
          status: 'Draft',
          invoiceSubTotal: 1000,
          totalTax: 100,
          totalDiscount: 0,
          totalAmount: 1100,
          totalPaid: 0,
          balanceAmount: 1100,
          dueDate: new Date('2026-07-01'),
          items: [],
        };
      };

      await service.create(validDto, userId);
      expect(capturedData.status).toBe('Draft');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when invoice does not exist', async () => {
      mockPrisma.invoice.findUnique = async () => null;
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
