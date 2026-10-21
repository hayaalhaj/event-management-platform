"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { session, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!session) router.replace("/login");
    else router.replace(session.role === "ADMIN" ? "/admin" : "/events");
  }, [hasHydrated, session, router]);

  return null;
}