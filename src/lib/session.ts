import { decodeJwt } from "@/lib/jwt";
import type { JwtPayload } from "@/types";

export function getSession(token: string | null): JwtPayload | null {
  if (!token) return null;
  const payload = decodeJwt<JwtPayload>(token);
  if (!payload) return null;
  // exp is in seconds, Date.now() is in milliseconds
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}