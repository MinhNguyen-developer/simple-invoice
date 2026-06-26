import { Typography, Space } from "antd";
import { CreateInvoiceForm } from "./create/CreateInvoiceForm.tsx";

const { Title } = Typography;

export function CreateInvoicePage() {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Title level={4} style={{ margin: 0 }}>
        Create Invoice
      </Title>
      <CreateInvoiceForm />
    </Space>
  );
}
