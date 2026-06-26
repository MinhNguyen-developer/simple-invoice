import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Space, Spin, Alert, Row, Col } from "antd";
import { getInvoice } from "@/api/invoices.ts";
import { InvoiceHeader } from "./detail/InvoiceHeader.tsx";
import { CustomerInfo } from "./detail/CustomerInfo.tsx";
import { LineItemsTable } from "./detail/LineItemsTable.tsx";
import { InvoiceSummary } from "./detail/InvoiceSummary.tsx";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <Alert
        type="error"
        message="Invoice not found"
        description="The invoice you are looking for does not exist or could not be loaded."
        showIcon
      />
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <InvoiceHeader invoice={invoice} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <CustomerInfo invoice={invoice} />
            <LineItemsTable
              items={invoice.items}
              currencySymbol={invoice.currencySymbol}
            />
          </Space>
        </Col>
        <Col xs={24} lg={10}>
          <InvoiceSummary invoice={invoice} />
        </Col>
      </Row>
    </Space>
  );
}
