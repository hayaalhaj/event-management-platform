import { useEffect, useState } from "react";
import axios from "axios";
import { getEventById } from "@/services/events";
import { getErrorMessage } from "@/lib/errors";
import type { EventDetails } from "@/types";

export function useEvent(id: number) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    getEventById(id)
      .then((res) => {
        if (!cancelled) setEvent(res);
      })
      .catch((err) => {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return {
    event,
    loading,
    error,
    notFound,
    refetch: () => setReloadKey((k) => k + 1),
  };
}