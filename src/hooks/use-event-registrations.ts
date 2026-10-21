import { useEffect, useState } from "react";
import { getEventRegistrations } from "@/services/registrations";
import { getErrorMessage } from "@/lib/errors";
import type { PaginatedRegistrations } from "@/types";

export function useEventRegistrations(
  eventId: number,
  page: number,
  limit: number
) {
  const [data, setData] = useState<PaginatedRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (Number.isNaN(eventId)) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEventRegistrations(eventId, page, limit)
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
  }, [eventId, page, limit, reloadKey]);

  return { data, loading, error, refetch: () => setReloadKey((k) => k + 1) };
}