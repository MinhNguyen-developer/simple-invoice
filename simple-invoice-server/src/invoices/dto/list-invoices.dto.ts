import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ListInvoicesDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number, starting at 1',
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Records per page' })
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    example: 'invoiceDate',
    enum: ['invoiceDate', 'dueDate', 'totalAmount'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['invoiceDate', 'dueDate', 'totalAmount'])
  sortBy?: 'invoiceDate' | 'dueDate' | 'totalAmount';

  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  ordering?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    example: 'Draft',
    enum: ['Draft', 'Pending', 'Paid', 'Overdue'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Draft', 'Pending', 'Paid', 'Overdue'])
  status?: string;

  @ApiPropertyOptional({
    example: 'paul',
    description:
      'Partial, case-insensitive search on invoice number or customer name',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Filter invoices on/after this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Filter invoices on/before this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  toDate?: string;
}
