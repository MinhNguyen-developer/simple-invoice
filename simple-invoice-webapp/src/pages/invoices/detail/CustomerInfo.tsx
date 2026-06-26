import { Descriptions, Card } from "antd";
import type { Invoice } from "@/types/invoice.ts";

interface CustomerInfoProps {
  invoice: Invoice;
}

export function CustomerInfo({ invoice }: CustomerInfoProps) {
  return (
    <Card title="Customer Information" size="small">
      <Descriptions column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Name">
          {invoice.customerFullname}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {invoice.customerEmail}
        </Descriptions.Item>
        {invoice.customerMobile && (
          <Descriptions.Item label="Mobile">
            {invoice.customerMobile}
          </Descriptions.Item>
        )}
        {invoice.customerAddress && (
          <Descriptions.Item label="Address">
            {invoice.customerAddress}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}
