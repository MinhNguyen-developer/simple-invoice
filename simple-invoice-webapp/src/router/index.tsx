import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute.tsx";
import { LoginPage } from "@/pages/login/LoginPage.tsx";
import { InvoiceListPage } from "@/pages/invoices/InvoiceListPage.tsx";
import { InvoiceDetailPage } from "@/pages/invoices/InvoiceDetailPage.tsx";
import { CreateInvoicePage } from "@/pages/invoices/CreateInvoicePage.tsx";
import { AppLayout } from "@/components/layout/AppLayout.tsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/invoices" replace /> },
          { path: "/invoices", element: <InvoiceListPage /> },
          { path: "/invoices/new", element: <CreateInvoicePage /> },
          { path: "/invoices/:id", element: <InvoiceDetailPage /> },
        ],
      },
    ],
  },
]);
