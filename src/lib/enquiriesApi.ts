/** Async repository for the enquiry pipeline — talks to the Express API. */
import { api } from "./api";
import type { AdminNotification, Enquiry, EnquiryStatus, NewEnquiryInput } from "./enquiries";
import type { Role } from "../auth/context";

export interface EnquiryListParams {
  q?: string; status?: string; industry?: string; size?: string;
  assigned?: string; sort?: string; archived?: boolean; page?: number; limit?: number;
}
export interface EnquiryListResult {
  rows: Enquiry[]; total: number; page: number; pages: number;
}
export interface EnquiryStats {
  total: number; byStatus: Record<EnquiryStatus, number>;
}
export interface AppUser {
  id: number; name: string; email: string; role: Role;
}

export const submitEnquiry = (input: NewEnquiryInput) =>
  api<{ id: string }>("/api/public/enquiries", { method: "POST", auth: false, body: input });

export const fetchStats = () => api<EnquiryStats>("/api/enquiries/stats");

export function fetchEnquiries(p: EnquiryListParams): Promise<EnquiryListResult> {
  const qs = new URLSearchParams();
  if (p.q) qs.set("q", p.q);
  qs.set("status", p.status ?? "all");
  qs.set("industry", p.industry ?? "all");
  qs.set("size", p.size ?? "all");
  qs.set("assigned", p.assigned ?? "all");
  qs.set("sort", p.sort ?? "new");
  qs.set("archived", p.archived ? "1" : "0");
  qs.set("page", String(p.page ?? 1));
  qs.set("limit", String(p.limit ?? 20));
  return api<EnquiryListResult>(`/api/enquiries?${qs.toString()}`);
}

export const fetchEnquiry = (id: string) => api<Enquiry>(`/api/enquiries/${id}`);

export const patchEnquiry = (id: string, patch: { status?: EnquiryStatus; assignedTo?: string | null; demoDate?: string | null; archived?: boolean }) =>
  api<Enquiry>(`/api/enquiries/${id}`, { method: "PATCH", body: patch });

export const convertEnquiry = (id: string) =>
  api<Enquiry>(`/api/enquiries/${id}/convert`, { method: "POST" });

export const postEnquiryNote = (id: string, text: string) =>
  api<Enquiry>(`/api/enquiries/${id}/notes`, { method: "POST", body: { text } });

export const fetchNotifications = () => api<AdminNotification[]>("/api/notifications");
export const markNotifRead = (id: string) => api(`/api/notifications/${id}/read`, { method: "PATCH" });
export const markAllNotifsRead = () => api("/api/notifications/read-all", { method: "POST" });

export const fetchUsers = () => api<AppUser[]>("/api/users");
export const patchUserRole = (id: number, role: Role) =>
  api<AppUser>(`/api/users/${id}/role`, { method: "PATCH", body: { role } });
