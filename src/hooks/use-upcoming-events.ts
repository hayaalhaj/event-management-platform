import { useEffect, useState } from "react";
import { getUpcomingEvents } from "@/services/events";
import { getErrorMessage } from "@/lib/errors";
import type { EventItem, EventsQuery, Paginated } from "@/types";

export function useUpcomingEvents(query: EventsQuery) {
  const [data, setData] = useState<Paginated<EventItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { page, limit, search, type, dateFrom, dateTo } = query;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getUpcomingEvents({ page, limit, search, type, dateFrom, dateTo })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, type, dateFrom, dateTo, reloadKey]);

  return { data, loading, error, refetch: () => setReloadKey((k) => k + 1) };
}