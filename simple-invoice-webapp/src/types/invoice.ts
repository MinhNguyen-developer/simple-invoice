export type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  name: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description?: string;
  status: InvoiceStatus;
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  customerFullname: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  createdAt: string;
  createdBy: string;
  items: InvoiceItem[];
}

export interface PagingMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  paging: PagingMeta;
}

export interface ListInvoicesParams {
  page?: number;
  pageSize?: number;
  sortBy?: "invoiceDate" | "dueDate" | "totalAmount";
  ordering?: "ASC" | "DESC";
  status?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateInvoiceItemRequest {
  name: string;
  quantity: number;
  rate: number;
}

export interface CreateInvoiceRequest {
  customerFullname: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceNumber: string;
  invoiceReference?: string;
  description?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  item: CreateInvoiceItemRequest;
  taxPercent?: number;
  discount?: number;
}
