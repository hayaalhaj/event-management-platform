import type { EventItem } from "@/types";
import type { EducationLevel } from "@/types";

export const EVENT_TYPES = ["CONFERENCE", "WEBINAR", "WORKSHOP"] as const;

export function isPastEvent(event: EventItem): boolean {
  return new Date(event.event_date).getTime() < Date.now();
}

export function isFullEvent(event: EventItem): boolean {
  return (
    event.registrationCount !== undefined &&
    event.registrationCount >= event.max_attendees
  );
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "BACHELORS", label: "Bachelor's degree" },
  { value: "MASTERS", label: "Master's degree" },
  { value: "PHD", label: "PhD" },
  { value: "OTHER", label: "Other" },
];
export function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "APPROVED" || status === "COMPLETED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary"; // PENDING
}