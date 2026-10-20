export type Gender = "MALE" | "FEMALE" | "OTHER";
export type UserRole = "ADMIN" | "USER";
export type EventType = "CONFERENCE" | "WEBINAR" | "WORKSHOP";
export type EducationLevel =
  | "HIGH_SCHOOL"
  | "BACHELORS"
  | "MASTERS"
  | "PHD"
  | "OTHER";
export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AttendanceStatus = "PENDING" | "APPROVED" | "COMPLETED";

export interface EventItem {
  id: number;
  name: string;
  description: string;
  max_attendees: number;
  event_date: string;
  event_type: EventType;
  registrationCount?: number;
}

export interface Paginated<T> {
  message: string;
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface LoginResponse {
  message: string;
  access_token: string;
}

export interface AttendedEvent {
  event: EventItem;
  registrationStatus: RegistrationStatus;
  attendanceStatus: AttendanceStatus;
}

export interface EventsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: EventType | "";
  dateFrom?: string;
  dateTo?: string;
}
export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
export interface EventDetails extends EventItem {
  registrationCount: number;
}

export interface RegisterPayload {
  linkedinProfile?: string;
  educationLevel?: EducationLevel;
  motivation?: string;
}

export interface RegistrationResponse {
  message: string;
  registrationId: number;
  status: RegistrationStatus;
  eventId: number;
  userId: number;
}