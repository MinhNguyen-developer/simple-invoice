import apiClient from "./client.ts";
import type {
  Invoice,
  InvoiceListResponse,
  ListInvoicesParams,
  CreateInvoiceRequest,
} from "@/types/invoice.ts";

export const listInvoices = async (
  params: ListInvoicesParams,
): Promise<InvoiceListResponse> => {
  const response = await apiClient.get<InvoiceListResponse>("/invoices", {
    params,
  });
  return response.data;
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const response = await apiClient.get<Invoice>(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (
  data: CreateInvoiceRequest,
): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>("/invoices", data);
  return response.data;
};
