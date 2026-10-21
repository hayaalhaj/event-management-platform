import { api } from "@/lib/api";
import type { RegisterPayload, RegistrationResponse } from "@/types";
import type { PaginatedRegistrations } from "@/types";

export async function registerForEvent(
  eventId: number,
  payload: RegisterPayload
) {
  const { data } = await api.post<RegistrationResponse>(
    `/registrations/${eventId}`,
    payload
  );
  return data;
}
export async function getEventRegistrations(
  eventId: number,
  page: number,
  limit: number
) {
  const { data } = await api.get<PaginatedRegistrations>(
    `/registrations/event/${eventId}`,
    { params: { page, limit } }
  );
  return data;
}

export async function approveRegistration(registrationId: number) {
  const { data } = await api.patch(`/registrations/${registrationId}/approve`);
  return data;
}