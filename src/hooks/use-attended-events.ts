import { useEffect, useState } from "react";
import { getAttendedEvents } from "@/services/events";
import { getErrorMessage } from "@/lib/errors";
import type { AttendedEvent } from "@/types";

export function useAttendedEvents() {
  const [items, setItems] = useState<AttendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAttendedEvents()
      .then((res) => {
        if (!cancelled) setItems(res);
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
  }, [reloadKey]);

  return { items, loading, error, refetch: () => setReloadKey((k) => k + 1) };
}