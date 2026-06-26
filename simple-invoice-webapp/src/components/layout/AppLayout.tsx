import { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Avatar,
  Dropdown,
  Typography,
  Grid,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/store/authStore.ts";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const NAV_ITEMS = [
  {
    key: "/invoices",
    icon: <FileTextOutlined />,
    label: "Invoices",
  },
  {
    key: "/invoices/new",
    icon: <PlusOutlined />,
    label: "New Invoice",
  },
];

function SideMenu({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  const selectedKey = location.pathname.startsWith("/invoices/new")
    ? "/invoices/new"
    : location.pathname.startsWith("/invoices/")
      ? "/invoices"
      : location.pathname;

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: (
      <Link to={item.key} onClick={() => onClose?.()}>
        {item.label}
      </Link>
    ),
  }));

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={navItems}
      style={{ borderRight: 0, height: "100%" }}
    />
  );
}

export function AppLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: (
        <Link to="/login" onClick={logout}>
          Sign Out
        </Link>
      ),
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          theme="light"
          width={220}
          style={{
            boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
            position: "fixed",
            height: "100vh",
            left: 0,
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Text strong style={{ fontSize: 18, color: "#4f46e5" }}>
              SimpleInvoice
            </Text>
          </div>
          <SideMenu />
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 220 }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            {isMobile && (
              <Text strong style={{ fontSize: 16, color: "#4f46e5" }}>
                SimpleInvoice
              </Text>
            )}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: "#4f46e5" }}
              />
              <Text style={{ display: isMobile ? "none" : "inline" }}>
                {user?.fullname ?? user?.email ?? "User"}
              </Text>
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: "24px",
            minHeight: "calc(100vh - 64px)",
            background: "#f5f5f5",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 24,
              minHeight: "100%",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* Mobile Drawer */}
      <Drawer
        title="SimpleInvoice"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={240}
        styles={{ body: { padding: 0 } }}
      >
        <SideMenu onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </Layout>
  );
}
