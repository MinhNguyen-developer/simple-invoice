import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvoiceFilters } from "@/pages/invoices/components/InvoiceFilters.tsx";

describe("InvoiceFilters", () => {
  it("renders status select with All Statuses option", () => {
    render(
      <InvoiceFilters
        status=""
        fromDate=""
        toDate=""
        onStatusChange={vi.fn()}
        onDateRangeChange={vi.fn()}
      />,
    );
    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("calls onStatusChange when a status is selected", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();

    render(
      <InvoiceFilters
        status=""
        fromDate=""
        toDate=""
        onStatusChange={onStatusChange}
        onDateRangeChange={vi.fn()}
      />,
    );

    // Open the select dropdown
    await user.click(screen.getByText("All Statuses"));

    // Find and click the Paid option
    const paidOption = await screen.findByText("Paid");
    await user.click(paidOption);

    expect(onStatusChange).toHaveBeenCalledWith("Paid", expect.anything());
  });
});
