import { Select, DatePicker, Space } from "antd";
import dayjs from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";

const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
];

interface InvoiceFiltersProps {
  status: string;
  fromDate: string;
  toDate: string;
  onStatusChange: (status: string) => void;
  onDateRangeChange: (from: string, to: string) => void;
  showStatusFilter?: boolean;
  showDateRangeFilter?: boolean;
}

export function InvoiceFilters({
  status,
  fromDate,
  toDate,
  onStatusChange,
  onDateRangeChange,
  showStatusFilter = true,
  showDateRangeFilter = true,
}: InvoiceFiltersProps) {
  const rangeValue: RangePickerProps["value"] =
    fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : null;

  const handleRangeChange: RangePickerProps["onChange"] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateRangeChange(
        dates[0].format("YYYY-MM-DD"),
        dates[1].format("YYYY-MM-DD"),
      );
    } else {
      onDateRangeChange("", "");
    }
  };

  return (
    <Space wrap>
      {showStatusFilter && (
        <Select
          value={status || ""}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          style={{ width: 160 }}
          placeholder="Filter by status"
          data-testid="status-filter"
        />
      )}
      {showDateRangeFilter && (
        <RangePicker
          value={rangeValue}
          onChange={handleRangeChange}
          format="YYYY-MM-DD"
          placeholder={["From date", "To date"]}
          data-testid="date-range-filter"
        />
      )}
    </Space>
  );
}
