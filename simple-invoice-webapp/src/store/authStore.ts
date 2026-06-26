import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth.ts";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => {
      const token = getStoredToken();

      return {
        user: null,
        token,
        isAuthenticated: !!token,
        setUser: (user) => set({ user }),
        login: (nextToken, user) => {
          localStorage.setItem("access_token", nextToken);
          set({ token: nextToken, user, isAuthenticated: true });
        },
        logout: () => {
          localStorage.removeItem("access_token");
          set({ token: null, user: null, isAuthenticated: false });
        },
      };
    },
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
