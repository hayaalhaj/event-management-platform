"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { EventCard } from "@/components/event-card";
import {
  EventFilters,
  type EventFiltersValue,
} from "@/components/event-filters";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useUpcomingEvents } from "@/hooks/use-upcoming-events";

const PAGE_SIZE = 9;

const EMPTY_FILTERS: EventFiltersValue = {
  search: "",
  type: "",
  dateFrom: "",
  dateTo: "",
};

function EventsContent() {
  const [filters, setFilters] = useState<EventFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search);

  const { data, loading, error, refetch } = useUpcomingEvents({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    type: filters.type,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const handleFiltersChange = (next: EventFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const events = data?.items ?? [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Upcoming events</h1>
        <p className="text-sm text-muted-foreground">
          Browse and register for events.
        </p>
      </div>

      <EventFilters
        value={filters}
        onChange={handleFiltersChange}
        onReset={() => handleFiltersChange(EMPTY_FILTERS)}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={refetch}
          >
            Try again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No upcoming events found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
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

export default function EventsPage() {
  return (
    <AuthGuard>
      <Navbar />
      <EventsContent />
    </AuthGuard>
  );
}