"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { token, session, hasHydrated, logout } = useAuth();

  const roleMismatch =
    requiredRole !== undefined && session?.role !== requiredRole;

  useEffect(() => {
    if (!hasHydrated) return;

    if (!session) {
      if (token) logout(); // token exists but expired or invalid
      router.replace("/login");
      return;
    }

    if (roleMismatch) {
      router.replace(session.role === "ADMIN" ? "/admin" : "/events");
    }
  }, [hasHydrated, session, token, roleMismatch, logout, router]);

  if (!hasHydrated || !session || roleMismatch) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}