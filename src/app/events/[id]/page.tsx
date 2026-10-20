"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { RegistrationForm } from "@/components/registration-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEvent } from "@/hooks/use-event";
import { formatEventDate, isFullEvent, isPastEvent } from "@/lib/events";

function EventDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { event, loading, error, notFound, refetch } = useEvent(id);
  const [submitted, setSubmitted] = useState(false);

  const backLink = (
    <Link
      href="/events"
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      ← Back to events
    </Link>
  );

  if (loading && !event) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        {backLink}
        <p className="py-12 text-center text-muted-foreground">
          This event was not found or is no longer available.
        </p>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        {backLink}
        <div className="rounded-md border border-destructive/50 p-4 text-sm">
          <p className="text-destructive">{error ?? "Something went wrong."}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>
            Try again
          </Button>
        </div>
      </main>
    );
  }

  const past = isPastEvent(event);
  const full = isFullEvent(event);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4">
      {backLink}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{event.event_type}</Badge>
            {past && <Badge variant="outline">Past</Badge>}
            {full && <Badge variant="destructive">Full</Badge>}
          </div>
          <CardTitle className="mt-2 text-2xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="whitespace-pre-line text-muted-foreground">
            {event.description}
          </p>
          <p className="text-sm">
            <strong>Date:</strong> {formatEventDate(event.event_date)}
          </p>
          <p className="text-sm">
            <strong>Registered:</strong> {event.registrationCount} /{" "}
            {event.max_attendees}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm">
              Your registration was submitted and is pending admin approval. You
              can track it from your registrations page.
            </p>
          ) : past ? (
            <p className="text-sm text-muted-foreground">
              This event has already taken place. Registration is closed.
            </p>
          ) : full ? (
            <p className="text-sm text-muted-foreground">
              This event is full. Registration is closed.
            </p>
          ) : (
            <RegistrationForm
              eventId={event.id}
              onSuccess={() => {
                setSubmitted(true);
                refetch();
              }}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function EventDetailsPage() {
  return (
    <AuthGuard>
      <Navbar />
      <Suspense fallback={null}>
        <EventDetailsContent />
      </Suspense>
    </AuthGuard>
  );
}