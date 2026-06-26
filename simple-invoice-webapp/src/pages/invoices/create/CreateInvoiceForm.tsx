import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  message,
  Divider,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { Dayjs } from "dayjs";
import { createInvoice } from "@/api/invoices.ts";

import type { CreateInvoiceRequest } from "@/types/invoice.ts";

const { Text } = Typography;

const CURRENCY_OPTIONS = [
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "AU$" },
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "SGD", label: "SGD - Singapore Dollar", symbol: "S$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
];

interface FormValues {
  customerFullname: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceNumber: string;
  invoiceReference?: string;
  description?: string;
  invoiceDate: Dayjs;
  dueDate: Dayjs;
  currency: string;
  itemName: string;
  itemQuantity: number;
  itemRate: number;
  taxPercent: number;
  discount: number;
}

export function CreateInvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate, isPending } = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      messageApi.success("Invoice created successfully!", 2, () => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        navigate("/invoices");
      });
    },
    onError: (err: AxiosError<{ message: string | string[] }>) => {
      const msg = err.response?.data?.message;
      const displayMsg = Array.isArray(msg)
        ? msg[0]
        : (msg ?? "Failed to create invoice");
      messageApi.error(displayMsg);
    },
  });

  const handleSubmit = (values: FormValues) => {
    const currency = CURRENCY_OPTIONS.find((c) => c.value === values.currency);
    const payload: CreateInvoiceRequest = {
      customerFullname: values.customerFullname,
      customerEmail: values.customerEmail,
      customerMobile: values.customerMobile,
      customerAddress: values.customerAddress,
      invoiceNumber: values.invoiceNumber,
      invoiceReference: values.invoiceReference,
      description: values.description,
      invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
      dueDate: values.dueDate.format("YYYY-MM-DD"),
      currency: values.currency,
      currencySymbol: currency?.symbol ?? values.currency,
      item: {
        name: values.itemName,
        quantity: values.itemQuantity,
        rate: values.itemRate,
      },
      taxPercent: values.taxPercent,
      discount: values.discount,
    };
    mutate(payload);
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ taxPercent: 10, discount: 0 }}
        scrollToFirstError
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Customer Section */}
          <Card title="Customer Information" size="small">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="customerFullname"
                  label="Customer Name"
                  rules={[
                    { required: true, message: "Customer name is required" },
                  ]}
                >
                  <Input placeholder="Full name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="customerEmail"
                  label="Customer Email"
                  rules={[
                    { required: true, message: "Customer email is required" },
                    { type: "email", message: "Must be a valid email address" },
                  ]}
                >
                  <Input placeholder="email@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="customerMobile" label="Mobile (Optional)">
                  <Input placeholder="+65 1234 5678" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="customerAddress" label="Address (Optional)">
                  <Input placeholder="123 Main St, City" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Invoice Section */}
          <Card title="Invoice Details" size="small">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="invoiceNumber"
                  label="Invoice Number"
                  rules={[
                    { required: true, message: "Invoice number is required" },
                  ]}
                >
                  <Input placeholder="IV-001" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="invoiceReference" label="Reference (Optional)">
                  <Input placeholder="#REF-001" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="invoiceDate"
                  label="Invoice Date"
                  rules={[
                    { required: true, message: "Invoice date is required" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="dueDate"
                  label="Due Date"
                  dependencies={["invoiceDate"]}
                  rules={[
                    { required: true, message: "Due date is required" },
                    ({ getFieldValue }) => ({
                      validator(_, value: Dayjs) {
                        const invoiceDate = getFieldValue(
                          "invoiceDate",
                        ) as Dayjs;
                        if (!value || !invoiceDate) return Promise.resolve();
                        if (value.isBefore(invoiceDate, "day")) {
                          return Promise.reject(
                            new Error(
                              "Due date must be on or after invoice date",
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true, message: "Currency is required" }]}
                >
                  <Select
                    options={CURRENCY_OPTIONS}
                    placeholder="Select currency"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="description" label="Description (Optional)">
                  <Input.TextArea
                    rows={2}
                    placeholder="Invoice description..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Line Item Section */}
          <Card title="Line Item" size="small">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="itemName"
                  label="Item Name"
                  rules={[{ required: true, message: "Item name is required" }]}
                >
                  <Input placeholder="Service or product name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item
                  name="itemQuantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: "Quantity is required" },
                    { type: "integer", message: "Must be a whole number" },
                    { type: "number", min: 1, message: "Must be at least 1" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    precision={0}
                    style={{ width: "100%" }}
                    placeholder="1"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item
                  name="itemRate"
                  label="Rate"
                  rules={[
                    { required: true, message: "Rate is required" },
                    {
                      type: "number",
                      min: 0.01,
                      message: "Must be greater than 0",
                    },
                  ]}
                >
                  <InputNumber
                    min={0.01}
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="100.00"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="taxPercent"
                  label="Tax (%)"
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "Tax must be non-negative",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="10"
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="discount"
                  label="Discount (Amount)"
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "Discount must be non-negative",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Text type="secondary" style={{ fontSize: 12 }}>
              * Total amount is calculated by the server: (Quantity × Rate) +
              Tax − Discount
            </Text>
          </Card>

          {/* Submit */}
          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => navigate("/invoices")}>Cancel</Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                data-testid="submit-invoice"
              >
                Create Invoice
              </Button>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}
