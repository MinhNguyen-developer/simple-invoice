import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InvoiceTable } from "@/pages/invoices/components/InvoiceTable.tsx";
import type { Invoice, ListInvoicesParams } from "@/types/invoice.ts";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockInvoices: Invoice[] = [
  {
    invoiceId: "inv-1",
    invoiceNumber: "IV001",
    invoiceDate: "2026-06-01",
    dueDate: "2026-07-01",
    currency: "AUD",
    currencySymbol: "AU$",
    status: "Pending",
    invoiceSubTotal: 1000,
    totalTax: 100,
    totalDiscount: 0,
    totalAmount: 1100,
    totalPaid: 0,
    balanceAmount: 1100,
    customerFullname: "Paul Anderson",
    customerEmail: "paul@test.com",
    createdAt: "2026-06-01T00:00:00Z",
    createdBy: "user-1",
    items: [],
  },
];

const defaultParams: ListInvoicesParams = {
  page: 1,
  pageSize: 10,
  ordering: "DESC",
};

describe("InvoiceTable", () => {
  it("renders invoice rows", () => {
    render(
      <MemoryRouter>
        <InvoiceTable
          data={mockInvoices}
          total={1}
          loading={false}
          params={defaultParams}
          onParamsChange={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("IV001")).toBeInTheDocument();
    expect(screen.getByText("Paul Anderson")).toBeInTheDocument();
  });

  it("renders Pending status tag", () => {
    render(
      <MemoryRouter>
        <InvoiceTable
          data={mockInvoices}
          total={1}
          loading={false}
          params={defaultParams}
          onParamsChange={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(
      <MemoryRouter>
        <InvoiceTable
          data={[]}
          total={0}
          loading={false}
          params={defaultParams}
          onParamsChange={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
  });
});
