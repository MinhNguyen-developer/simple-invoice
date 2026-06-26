import { Table, Card, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { InvoiceItem } from "@/types/invoice.ts";

const { Text } = Typography;

interface LineItemsTableProps {
  items: InvoiceItem[];
  currencySymbol: string;
}

export function LineItemsTable({ items, currencySymbol }: LineItemsTableProps) {
  const columns: ColumnsType<InvoiceItem> = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      width: 80,
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      align: "right",
      render: (val: number) =>
        `${currencySymbol} ${Number(val).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      align: "right",
      render: (_: unknown, record: InvoiceItem) => {
        const subtotal = record.quantity * Number(record.rate);
        return (
          <Text strong>
            {`${currencySymbol} ${subtotal.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`}
          </Text>
        );
      },
    },
  ];

  return (
    <Card title="Line Items" size="small">
      <Table<InvoiceItem>
        columns={columns}
        dataSource={items}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 400 }}
      />
    </Card>
  );
}
