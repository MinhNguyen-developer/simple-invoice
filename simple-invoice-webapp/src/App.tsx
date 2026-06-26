import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { getMe } from "./api/auth.ts";
import { useAuth } from "./store/authStore.ts";
import { router } from "./router/index.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { token, user, setUser, logout } = useAuth();

  useEffect(() => {
    if (!token || user) return;

    let isMounted = true;
    getMe()
      .then((profile) => {
        if (isMounted) setUser(profile);
      })
      .catch(() => {
        if (isMounted) logout();
      });

    return () => {
      isMounted = false;
    };
  }, [token, user, setUser, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#4f46e5",
            borderRadius: 6,
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
