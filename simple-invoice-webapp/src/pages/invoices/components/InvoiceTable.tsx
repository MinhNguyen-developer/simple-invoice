import { Table, Tag, Typography, Space } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type {
  Invoice,
  InvoiceStatus,
  ListInvoicesParams,
} from "@/types/invoice.ts";

const { Text } = Typography;

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  Draft: "default",
  Pending: "blue",
  Paid: "green",
  Overdue: "red",
};

interface InvoiceTableProps {
  data: Invoice[];
  total: number;
  loading: boolean;
  params: ListInvoicesParams;
  onParamsChange: (params: Partial<ListInvoicesParams>) => void;
  visibleColumnKeys?: string[];
}

export function InvoiceTable({
  data,
  total,
  loading,
  params,
  onParamsChange,
  visibleColumnKeys,
}: InvoiceTableProps) {
  const navigate = useNavigate();

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (val: string) => <Text strong>{val}</Text>,
      fixed: "left",
    },
    {
      title: "Customer",
      dataIndex: "customerFullname",
      key: "customerFullname",
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      sorter: true,
      sortOrder:
        params.sortBy === "invoiceDate"
          ? params.ordering === "ASC"
            ? "ascend"
            : "descend"
          : null,
      render: (val: string) => dayjs(val).format("DD MMM YYYY"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      sorter: true,
      sortOrder:
        params.sortBy === "dueDate"
          ? params.ordering === "ASC"
            ? "ascend"
            : "descend"
          : null,
      render: (val: string) => dayjs(val).format("DD MMM YYYY"),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: true,
      sortOrder:
        params.sortBy === "totalAmount"
          ? params.ordering === "ASC"
            ? "ascend"
            : "descend"
          : null,
      align: "right",
      render: (val: number, record: Invoice) => (
        <Text>{`${record.currencySymbol} ${Number(val).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: InvoiceStatus) => (
        <Tag color={STATUS_COLORS[val]}>{val}</Tag>
      ),
    },
  ];

  const renderedColumns =
    visibleColumnKeys && visibleColumnKeys.length > 0
      ? columns.filter(
          (column) =>
            typeof column.key === "string" &&
            visibleColumnKeys.includes(column.key),
        )
      : columns;

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Invoice> | SorterResult<Invoice>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const updates: Partial<ListInvoicesParams> = {
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 10,
    };

    if (s.order) {
      updates.sortBy = s.field as ListInvoicesParams["sortBy"];
      updates.ordering = s.order === "ascend" ? "ASC" : "DESC";
    } else {
      updates.sortBy = undefined;
      updates.ordering = "DESC";
    }

    onParamsChange(updates);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={0}>
      <Table<Invoice>
        columns={renderedColumns}
        dataSource={data}
        rowKey="invoiceId"
        loading={loading}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => navigate(`/invoices/${record.invoiceId}`),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (t) => `Total ${t} invoices`,
        }}
        scroll={{ x: "max-content" }}
      />
    </Space>
  );
}
