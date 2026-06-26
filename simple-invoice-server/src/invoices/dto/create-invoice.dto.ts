import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Honda RC150' })
  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
  name: string;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be a positive integer' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 1000 })
  @IsNumber({}, { message: 'Rate must be a number' })
  @IsPositive({ message: 'Rate must be a positive number' })
  @Type(() => Number)
  rate: number;
}

export class CreateInvoiceDto {
  // Customer fields
  @ApiProperty({ example: 'Paul' })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  customerFullname: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  @IsEmail({}, { message: 'Customer email must be a valid email address' })
  @IsNotEmpty({ message: 'Customer email is required' })
  customerEmail: string;

  @ApiPropertyOptional({ example: '947717364111' })
  @IsOptional()
  @IsString()
  customerMobile?: string;

  @ApiPropertyOptional({ example: 'Singapore' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  // Invoice fields
  @ApiProperty({ example: 'IV1780488206995' })
  @IsString()
  @IsNotEmpty({ message: 'Invoice number is required' })
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662' })
  @IsOptional()
  @IsString()
  invoiceReference?: string;

  @ApiPropertyOptional({ example: 'Invoice for services rendered' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-06-03' })
  @IsDateString(
    {},
    { message: 'Invoice date must be a valid date (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'Invoice date is required' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03' })
  @IsDateString({}, { message: 'Due date must be a valid date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: string;

  @ApiProperty({ example: 'AUD' })
  @IsString()
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string;

  @ApiProperty({ example: 'AU$' })
  @IsString()
  @IsNotEmpty({ message: 'Currency symbol is required' })
  currencySymbol: string;

  // Line item
  @ApiProperty({ type: CreateInvoiceItemDto })
  @IsNotEmpty({ message: 'Invoice item is required' })
  @Type(() => CreateInvoiceItemDto)
  item: CreateInvoiceItemDto;

  @ApiPropertyOptional({
    example: 10,
    description: 'Tax percentage, defaults to 10',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tax must be a number' })
  @Min(0, { message: 'Tax must be non-negative' })
  @Type(() => Number)
  taxPercent?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Discount amount, defaults to 0',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Discount must be a number' })
  @Min(0, { message: 'Discount must be non-negative' })
  @Type(() => Number)
  discount?: number;
}
