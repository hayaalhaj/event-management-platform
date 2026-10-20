"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { session, logout } = useAuth();

  return (
    <AuthGuard requiredRole="ADMIN">
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p>Signed in as {session?.email}</p>
        <Button onClick={logout}>Log out</Button>
      </main>
    </AuthGuard>
  );
}