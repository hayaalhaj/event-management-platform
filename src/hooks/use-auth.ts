"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth";
import { getSession } from "@/lib/session";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  const session = useMemo(() => getSession(token), [token]);

  return {
    token,
    session,
    role: session?.role ?? null,
    isAuthenticated: session !== null,
    hasHydrated,
    logout,
  };
}