"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { session, role, logout } = useAuth();

  const links =
    role === "ADMIN"
      ? [
          { href: "/admin", label: "Dashboard" },
          { href: "/events", label: "Upcoming events" },
        ]
      : [
          { href: "/events", label: "Events" },
          { href: "/my-registrations", label: "My registrations" },
        ];

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            Event Platform
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground md:inline">
            {session?.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}