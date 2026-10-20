"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAttendedEvents } from "@/hooks/use-attended-events";
import { formatEventDate, isPastEvent, statusVariant } from "@/lib/events";

function MyRegistrationsContent() {
  const { items, loading, error, refetch } = useAttendedEvents();

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">My registrations</h1>
        <p className="text-sm text-muted-foreground">
          Events you registered for and their status.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t registered for any event yet.
          </p>
          <Link href="/events" className={buttonVariants()}>
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ event, registrationStatus, attendanceStatus }) => {
            const past = isPastEvent(event);
            return (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{event.event_type}</Badge>
                    {past && <Badge variant="outline">Past</Badge>}
                  </div>
                  <CardTitle className="mt-2">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{formatEventDate(event.event_date)}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1">
                      Registration:
                      <Badge variant={statusVariant(registrationStatus)}>
                        {registrationStatus}
                      </Badge>
                    </span>
                    <span className="flex items-center gap-1">
                      Attendance:
                      <Badge variant={statusVariant(attendanceStatus)}>
                        {attendanceStatus}
                      </Badge>
                    </span>
                  </div>
                  {!past && (
                    <Link
                      href={`/events/${event.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      View event
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function MyRegistrationsPage() {
  return (
    <AuthGuard>
      <Navbar />
      <MyRegistrationsContent />
    </AuthGuard>
  );
}