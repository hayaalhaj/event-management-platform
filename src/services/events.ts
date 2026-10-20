import { api } from "@/lib/api";
import type { EventItem, EventsQuery, Paginated } from "@/types";
import type { EventDetails } from "@/types";
import type { AttendedEvent } from "@/types";

function cleanParams(query: EventsQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== "" && v !== undefined)
  );
}

export async function getUpcomingEvents(query: EventsQuery) {
  const { data } = await api.get<Paginated<EventItem>>("/events/upcoming", {
    params: cleanParams(query),
  });
  return data;
}

export async function getEventById(id: number) {
  const { data } = await api.get<EventDetails>(`/events/${id}`);
  return data;
}
export async function getAttendedEvents() {
  const { data } = await api.get<{ message: string; events: AttendedEvent[] }>(
    "/events/attended"
  );
  return data.events;
}