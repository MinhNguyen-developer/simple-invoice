import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Space, Typography, Row, Col, Select, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { listInvoices } from "@/api/invoices.ts";
import { InvoiceSearchBar } from "./components/InvoiceSearchBar.tsx";
import { InvoiceTable } from "./components/InvoiceTable.tsx";
import type { ListInvoicesParams } from "@/types/invoice.ts";
import { useDebounce } from "@/hooks/useDebounce.ts";
import { useColumns } from "@/hooks/useColumns.tsx";
import { useFilters } from "@/hooks/useFilters.tsx";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
];

const DEFAULT_PARAMS: ListInvoicesParams = {
  page: 1,
  pageSize: 10,
  ordering: "DESC",
};

const ALL_COLUMNS = [
  { key: "invoiceNumber", label: "Invoice #" },
  { key: "customerFullname", label: "Customer" },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "dueDate", label: "Due Date" },
  { key: "totalAmount", label: "Total Amount" },
  { key: "status", label: "Status" },
] as const;

const DEFAULT_VISIBLE_COLUMN_KEYS = ALL_COLUMNS.map(
  (column) => column.key,
) as (typeof ALL_COLUMNS)[number]["key"][];

const ALL_FILTER_KEYS = ["keyword", "status", "dateRange"] as const;

const DEFAULT_VISIBLE_FILTER_KEYS = [...ALL_FILTER_KEYS] as const;

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [params, setParams] = useState<ListInvoicesParams>(DEFAULT_PARAMS);

  const { visibleColumnKeys, popover: columnsPopover } = useColumns(
    ALL_COLUMNS,
    DEFAULT_VISIBLE_COLUMN_KEYS,
    {
      buttonLabel: "Columns",
      title: "Show/Hide Columns",
    },
  );

  const debouncedKeyword = useDebounce(keyword, 400);

  const queryParams: ListInvoicesParams = {
    ...params,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", queryParams],
    queryFn: () => listInvoices(queryParams),
    staleTime: 30_000,
  });

  const handleParamsChange = useCallback(
    (updates: Partial<ListInvoicesParams>) => {
      setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
    },
    [],
  );

  const handleKeywordChange = useCallback((val: string) => {
    setKeyword(val);
    setParams((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setParams((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  }, []);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setParams((prev) => ({
      ...prev,
      fromDate: from || undefined,
      toDate: to || undefined,
      page: 1,
    }));
  }, []);

  const filterDefinitions = useMemo(
    () => [
      {
        key: "keyword" as const,
        label: "Search",
        render: () => (
          <Col xs={24} md={10} key="keyword-filter">
            <InvoiceSearchBar value={keyword} onChange={handleKeywordChange} />
          </Col>
        ),
      },
      {
        key: "status" as const,
        label: "Status",
        render: () => (
          <Col xs={24} md={7} key="status-filter">
            <Select
              value={params.status ?? ""}
              onChange={(value) => handleStatusChange(value)}
              options={STATUS_OPTIONS}
              style={{ width: "100%" }}
              placeholder="Filter by status"
            />
          </Col>
        ),
      },
      {
        key: "dateRange" as const,
        label: "Date Range",
        render: () => (
          <Col xs={24} md={7} key="date-filter">
            <RangePicker
              style={{ width: "100%" }}
              value={
                params.fromDate && params.toDate
                  ? [dayjs(params.fromDate), dayjs(params.toDate)]
                  : null
              }
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleDateRangeChange(
                    dates[0].format("YYYY-MM-DD"),
                    dates[1].format("YYYY-MM-DD"),
                  );
                } else {
                  handleDateRangeChange("", "");
                }
              }}
              format="YYYY-MM-DD"
              placeholder={["From date", "To date"]}
            />
          </Col>
        ),
      },
    ],
    [
      handleDateRangeChange,
      handleKeywordChange,
      handleStatusChange,
      keyword,
      params.fromDate,
      params.status,
      params.toDate,
    ],
  );

  const { renderedFilters, popover: filtersPopover } = useFilters(
    filterDefinitions,
    DEFAULT_VISIBLE_FILTER_KEYS,
    {
      buttonLabel: "Filters",
      title: "Show/Hide Filters",
    },
  );

  return (
    <Space orientation="vertical" style={{ width: "100%" }} size="large">
      <Row justify="space-between" align="middle" wrap>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Invoices
          </Title>
        </Col>
        <Col>
          <Space>
            {columnsPopover}
            {filtersPopover}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/invoices/new")}
              data-testid="create-invoice-btn"
            >
              New Invoice
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle">
        {renderedFilters}
      </Row>

      <InvoiceTable
        data={data?.data ?? []}
        total={data?.paging.total ?? 0}
        loading={isLoading}
        params={params}
        onParamsChange={handleParamsChange}
        visibleColumnKeys={visibleColumnKeys}
      />
    </Space>
  );
}
