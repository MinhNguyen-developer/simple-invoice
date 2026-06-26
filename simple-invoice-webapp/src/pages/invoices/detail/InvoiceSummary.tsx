import { Descriptions, Card, Typography } from "antd";
import type { Invoice } from "@/types/invoice.ts";

const { Text } = Typography;

function formatAmount(symbol: string, amount: number): string {
  return `${symbol} ${Number(amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
}

interface InvoiceSummaryProps {
  invoice: Invoice;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const sym = invoice.currencySymbol;

  return (
    <Card title="Invoice Summary" size="small">
      <Descriptions column={1} size="small" layout="horizontal">
        <Descriptions.Item label="Subtotal">
          {formatAmount(sym, invoice.invoiceSubTotal)}
        </Descriptions.Item>
        <Descriptions.Item label="Tax">
          {formatAmount(sym, invoice.totalTax)}
        </Descriptions.Item>
        <Descriptions.Item label="Discount">
          - {formatAmount(sym, invoice.totalDiscount)}
        </Descriptions.Item>
        <Descriptions.Item label={<Text strong>Total Amount</Text>}>
          <Text strong style={{ fontSize: 16 }}>
            {formatAmount(sym, invoice.totalAmount)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Amount Paid">
          {formatAmount(sym, invoice.totalPaid)}
        </Descriptions.Item>
        <Descriptions.Item label={<Text strong>Balance Due</Text>}>
          <Text
            strong
            style={{ color: invoice.balanceAmount > 0 ? "#cf1322" : "#389e0d" }}
          >
            {formatAmount(sym, invoice.balanceAmount)}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
