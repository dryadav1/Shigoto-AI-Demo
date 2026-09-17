export type Lang = "ja" | "en";
export type PermissionLevel = "AUTO" | "APPROVAL" | "RESTRICTED";
export type EmployeeStatus = "active" | "coming_soon";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type Risk = "Low" | "Medium" | "High";

export interface AIEmployee {
  id: string;
  icon: string;
  tasksCompleted: number;
  timeSavedHrs: number;
  successRate: number;
  permissions: { label: string; level: PermissionLevel }[];
  tools: string[];
  connectedTools: string[];
}

export interface Approval {
  id: string;
  actionKey: string;
  employeeId: string;
  customer: string;
  risk: Risk;
  created: string;
  status: ApprovalStatus;
  detailJa: string;
  detailEn: string;
  draftJa: string;
  draftEn: string;
}

export interface UniversalTask {
  id: string;
  titleJa: string;
  titleEn: string;
  owner: "ai-secretary" | "ai-sales" | "ai-knowledge" | "human";
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due: string;
}

export interface AuditEvent {
  time: string;
  actorJa: string;
  actorEn: string;
  employeeJa: string;
  employeeEn: string;
  action: string;
  targetJa: string;
  targetEn: string;
  resultJa: string;
  resultEn: string;
  status: "done" | "waiting" | "approved";
}
