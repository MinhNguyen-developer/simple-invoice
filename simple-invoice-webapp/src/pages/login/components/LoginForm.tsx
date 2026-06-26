import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth.ts";
import { useAuth } from "@/store/authStore.ts";
import type { LoginRequest } from "@/types/auth.ts";
import type { AxiosError } from "axios";

const { Title } = Typography;

export function LoginForm() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuth();
  const [form] = Form.useForm<LoginRequest>();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      storeLogin(data.accessToken, data.user);
      navigate("/invoices", { replace: true });
    },
  });

  const errorMessage = (() => {
    if (!error) return null;
    const axiosError = error as AxiosError<{ message: string }>;
    return (
      axiosError.response?.data?.message ?? "Login failed. Please try again."
    );
  })();

  return (
    <Card
      style={{ width: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
      styles={{ body: { padding: 40 } }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={3} style={{ margin: 0 }}>
          SimpleInvoice
        </Title>
        <Typography.Text type="secondary">
          Sign in to your account
        </Typography.Text>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          data-testid="login-error"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => mutate(values)}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="admin@simpleinvoice.com"
            size="large"
            data-testid="email-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            size="large"
            data-testid="password-input"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isPending}
            data-testid="login-submit"
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
