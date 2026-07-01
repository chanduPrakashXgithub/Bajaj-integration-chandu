import { RoleId } from "../types/domain";
import { colors } from "./theme";

export function toneClass(type: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    Critical: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
    High: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
    Medium: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
    Low: { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" },
    Pending: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
    "In Progress": { bg: "rgba(0,141,210,0.1)", text: "#008DD2", border: "rgba(0,141,210,0.2)" },
    Completed: { bg: "rgba(18,183,106,0.1)", text: "#12B76A", border: "rgba(18,183,106,0.2)" },
    Resolved: { bg: "rgba(18,183,106,0.1)", text: "#12B76A", border: "rgba(18,183,106,0.2)" },
    Escalated: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
    Revoked: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
    Approved: { bg: "rgba(18,183,106,0.1)", text: "#12B76A", border: "rgba(18,183,106,0.2)" },
    Rejected: { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" },
    "At Risk": { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
    AtRisk: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
    Operational: { bg: "rgba(18,183,106,0.1)", text: "#12B76A", border: "rgba(18,183,106,0.2)" },
    Down: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
    Scheduled: { bg: "rgba(0,141,210,0.1)", text: "#008DD2", border: "rgba(0,141,210,0.2)" },
    Closed: { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" },
    Warning: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
    Success: { bg: "rgba(18,183,106,0.1)", text: "#12B76A", border: "rgba(18,183,106,0.2)" },
    Error: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
    Info: { bg: "rgba(0,141,210,0.1)", text: "#008DD2", border: "rgba(0,141,210,0.2)" },
  };
  return map[type] || { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
}

export function roleAccent(role: RoleId): { bg: string; text: string } {
  const map: Record<RoleId, string> = {
    lc: "#005BAC",
    branchManager: "#12B76A",
    aa: "#12B76A",
    rm: "#8B5CF6",
    am: "#8B5CF6",
    rrm: "#8B5CF6",
  };
  return { bg: map[role], text: colors.white };
}

export function roleIcon(role: RoleId): string {
  const map: Record<RoleId, string> = {
    lc: "UserCog",
    branchManager: "Briefcase",
    aa: "User",
    rm: "Crown",
    am: "Crown",
    rrm: "Crown",
  };
  return map[role];
}

export function pageIcon(pageId: string): string {
  const map: Record<string, string> = {
    home: "Home",
    dashboard: "Home",
    tasks: "ListChecks",
    complaints: "Wrench",
    issues: "AlertCircle",
    attendance: "MapPin",
    notifications: "Bell",
    profile: "IdCard",
    branch: "Building",
    branches: "Building",
    monitoring: "LineChart",
    approvals: "Stamp",
    visits: "Route",
    intelligence: "Satellite",
    alerts: "TriangleAlert",
    finance: "Wallet",
    analytics: "ChartColumn",
    users: "Users",
    settings: "Sliders",
  };
  return map[pageId] || "Circle";
}

export function progressColor(status: string): string {
  if (status === "Completed" || status === "RESOLVED" || status === "Approved") return colors.success;
  if (status === "Critical" || status === "Escalated" || status === "Revoked" || status === "Down") return colors.error;
  if (status === "In Progress") return colors.brandSecondary;
  return colors.brand;
}
