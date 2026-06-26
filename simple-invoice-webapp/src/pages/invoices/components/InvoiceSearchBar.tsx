import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface InvoiceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function InvoiceSearchBar({ value, onChange }: InvoiceSearchBarProps) {
  return (
    <Input
      allowClear
      placeholder="Search by invoice number or customer name"
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", maxWidth: 380 }}
      data-testid="invoice-search"
    />
  );
}
