"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { EventFilters, type EventFiltersValue } from "@/components/event-filters";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { Pagination } from "@/components/pagination";
import { useAdminEvents } from "@/hooks/use-admin-events";
import { useDebounce } from "@/hooks/use-debounce";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  formatEventDate,
  isFullEvent,
  isPastEvent,
} from "@/lib/events";

import type { EventItem } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: EventFiltersValue = {
  search: "",
  type: "",
  dateFrom: "",
  dateTo: "",
};

function AdminDashboardContent() {
  const [filters, setFilters] =
    useState<EventFiltersValue>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { data, loading, error, refetch } = useAdminEvents({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    type: filters.type,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.type,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.type) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage events, registrations, and attendees.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className={cn(
            buttonVariants(),
            "w-full sm:w-auto",
          )}
        >
          Create event
        </Link>
      </section>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Event filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EventFilters
            value={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>All events</CardTitle>

            {data && (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.total}{" "}
                {data.total === 1 ? "event" : "events"} found
              </p>
            )}
          </div>

          {loading && data && (
            <Skeleton className="h-8 w-20" />
          )}
        </CardHeader>

        <CardContent>
          {loading && !data ? (
            <EventsLoading />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={refetch}
            />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onReset={handleResetFilters}
            />
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {data.items.map((event) => (
                  <AdminEventRow
                    key={event.id}
                    event={event}
                    onDeleted={refetch}
                  />
                ))}
              </div>

              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
                disabled={loading}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function AdminEventRow({
  event,
  onDeleted,
}: {
  event: EventItem;
  onDeleted: () => void;
}) {
  const past = isPastEvent(event);
  const full = isFullEvent(event);
  const registrationCount = event.registrationCount ?? 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        past && "bg-muted/40",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Event information */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {event.event_type}
            </Badge>

            {past && (
              <Badge variant="outline">
                Past
              </Badge>
            )}

            {full && !past && (
              <Badge variant="destructive">
                Full
              </Badge>
            )}
          </div>

          <h3 className="text-base font-semibold">
            {event.name}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>
              {formatEventDate(event.event_date)}
            </span>

            <span>
              {registrationCount} / {event.max_attendees} registered
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Link
            href={`/admin/events/${event.id}/registrations`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            Attendees
          </Link>

          <DeleteEventDialog
            event={event}
            onDeleted={onDeleted}
          />
        </div>
      </div>
    </div>
  );
}

function EventsLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border p-4"
        >
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>

          <Skeleton className="h-5 w-2/3" />

          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm text-destructive">
        {message}
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h3 className="font-semibold">
        No events found
      </h3>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Try changing your filters or search terms."
          : "There are no events available yet."}
      </p>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onReset}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <AdminDashboardContent />
    </AuthGuard>
  );
}