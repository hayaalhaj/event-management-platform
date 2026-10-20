import { api } from "@/lib/api";
import type { RegisterPayload, RegistrationResponse } from "@/types";

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