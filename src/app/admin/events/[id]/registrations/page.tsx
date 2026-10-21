"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEvent } from "@/hooks/use-event";
import { useEventRegistrations } from "@/hooks/use-event-registrations";
import { approveRegistration } from "@/services/registrations";
import { getErrorMessage } from "@/lib/errors";
import {
  EDUCATION_LEVELS,
  formatEventDate,
  statusVariant,
} from "@/lib/events";

const PAGE_SIZE = 10;

function RegistrationsContent() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const [page, setPage] = useState(1);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const { event, notFound } = useEvent(eventId);
  const { data, loading, error, refetch } = useEventRegistrations(
    eventId,
    page,
    PAGE_SIZE
  );

  const handleApprove = async (registrationId: number) => {
    setApprovingId(registrationId);
    try {
      await approveRegistration(registrationId);
      toast.success("Registration approved");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  };

  const registrations = data?.attendees ?? [];

  const backLink = (
    <Link
      href="/admin"
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      ← Back to dashboard
    </Link>
  );

  if (notFound) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-4">
        {backLink}
        <p className="py-12 text-center text-muted-foreground">
          This event was not found.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      {backLink}

      <div>
        <h1 className="text-2xl font-bold">
          Registrations{event ? `: ${event.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {event
            ? `${formatEventDate(event.event_date)} · ${event.registrationCount} / ${event.max_attendees} registered`
            : "Loading event..."}
        </p>
      </div>

      {loading && !data ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>
            Try again
          </Button>
        </div>
      ) : registrations.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No registrations for this event yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Education</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Motivation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => {
              const education = EDUCATION_LEVELS.find(
                (l) => l.value === reg.education_level
              );
              const safeLinkedin =
                reg.linkedin_profile &&
                /^https?:\/\//.test(reg.linkedin_profile)
                  ? reg.linkedin_profile
                  : null;

              return (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">
                    {reg.user.email}
                  </TableCell>
                  <TableCell>{formatEventDate(reg.registered_at)}</TableCell>
                  <TableCell>{education?.label ?? "-"}</TableCell>
                  <TableCell>
                    {safeLinkedin ? (
                      <a
                        href={safeLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Profile
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {reg.motivation || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(reg.status)}>
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {reg.status === "PENDING" && (
                      <Button
                        size="sm"
                        disabled={approvingId === reg.id}
                        onClick={() => handleApprove(reg.id)}
                      >
                        {approvingId === reg.id ? "Approving..." : "Approve"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Pagination
        page={data?.page ?? page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        disabled={loading}
      />
    </main>
  );
}

export default function EventRegistrationsPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <Suspense fallback={null}>
        <RegistrationsContent />
      </Suspense>
    </AuthGuard>
  );
}