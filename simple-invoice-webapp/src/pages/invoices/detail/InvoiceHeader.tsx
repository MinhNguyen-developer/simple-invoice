import { Descriptions, Tag, Space, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { Invoice, InvoiceStatus } from "@/types/invoice.ts";

const { Title } = Typography;

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  Draft: "default",
  Pending: "blue",
  Paid: "green",
  Overdue: "red",
};

interface InvoiceHeaderProps {
  invoice: Invoice;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const navigate = useNavigate();

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/invoices")}
          type="text"
        >
          Back to Invoices
        </Button>
      </Space>
      <Space
        align="center"
        style={{ justifyContent: "space-between", width: "100%" }}
        wrap
      >
        <Title level={4} style={{ margin: 0 }}>
          Invoice {invoice.invoiceNumber}
        </Title>
        <Tag
          color={STATUS_COLORS[invoice.status as InvoiceStatus]}
          style={{ fontSize: 14, padding: "4px 12px" }}
        >
          {invoice.status}
        </Tag>
      </Space>
      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
        {invoice.invoiceReference && (
          <Descriptions.Item label="Reference">
            {invoice.invoiceReference}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Invoice Date">
          {dayjs(invoice.invoiceDate).format("DD MMM YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Due Date">
          {dayjs(invoice.dueDate).format("DD MMM YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Currency">
          {invoice.currency} ({invoice.currencySymbol})
        </Descriptions.Item>
        {invoice.description && (
          <Descriptions.Item label="Description" span={3}>
            {invoice.description}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Space>
  );
}
