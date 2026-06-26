import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { ListInvoicesDto } from './dto/list-invoices.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List invoices with search, filter, sort, and pagination',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of invoices' })
  findAll(@Query() query: ListInvoicesDto) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiOperation({ summary: 'Get invoice detail by ID' })
  @ApiResponse({ status: 200, description: 'Invoice detail' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Invoice number already exists' })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req: AuthRequest,
  ) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }
}
