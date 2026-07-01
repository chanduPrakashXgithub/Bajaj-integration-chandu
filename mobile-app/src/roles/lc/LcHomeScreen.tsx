import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Plus,
  ShieldAlert,
  Cpu,
  Wrench,
  Star,
} from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { Card } from "../../shared/components/Card";
import { StatCard } from "../../shared/components/StatCard";
import { QuickButton } from "../../shared/components/QuickButton";
import { Badge } from "../../shared/components/Badge";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

const pct = (value?: number) => `${Math.round(value ?? 0)}%`;

function money(value?: number) {
  const amount = value ?? 0;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

function getTimeUntilNextMonday() {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7) + (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0 ? 0 : 0));
  if (now.getDay() === 1) {
    nextMonday.setDate(now.getDate() + 7);
  } else {
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
  }
  nextMonday.setHours(0, 0, 0, 0);
  
  const diffMs = nextMonday.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m left`;
}

export function LcHomeScreen() {
  const {
    state,
    currentUser,
    getBranch,
    scopedTasks,
    scopedComplaints,
    scopedAppliances,
    scopedAttendance,
    setPage,
    openFormModal,
    openTaskDetail,
    openComplaintDetail,
    openApplianceDetail,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"routine" | "audits" | "self">("routine");

  const branch = getBranch(currentUser.branchId);
  const branchId = branch?.id ?? currentUser.branchId;

  const tasks = scopedTasks.filter((task) => task.branchId === branchId);
  const pendingTasks = tasks.filter((task) => task.status === "Pending");
  const activeTasks = tasks.filter((task) => task.status === "Pending" || task.status === "In Progress");
  const completedTasks = tasks.filter((task) => task.status === "Completed");

  // KPI: only tasks assigned directly to the LC (not all branch tasks)
  const myActiveTasks = activeTasks.filter(
    (task) => String(task.assignedTo) === String(currentUser.id) ||
      (task.assignedTo == null && task.audience === "lc")
  );
  const myPendingTasks = myActiveTasks.filter((task) => task.status === "Pending");
  const complaints = scopedComplaints.filter((complaint) => complaint.branchId === branchId);
  const activeComplaintsCount = scopedComplaints.filter((c) => c.status !== "RESOLVED").length;
  const openComplaints = complaints.filter((c) => c.status !== "RESOLVED");
  const openIssueCount = openComplaints.length;
  const appliances = scopedAppliances.filter((appliance) => appliance.branchId === branchId);
  const riskyAppliances = appliances.filter(
    (appliance) => appliance.status !== "Operational" || appliance.approvalStatus.includes("Pending")
  );

  const closureRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const todayAttendanceLog = scopedAttendance.find(
    (entry) => String(entry.userId) === String(currentUser.id) && entry.date === state.today
  );

  const weeklyChecks = activeTasks.filter(t => t.schedule === "Weekly" && t.assignedBy !== currentUser.id);
  const weeklyAudits = activeTasks.filter(t => t.schedule === "Weekly" || t.applianceId != null);
  const selfChecks = activeTasks.filter(t => t.assignedBy === currentUser.id);

  const displayTasks =
    activeTab === "routine" ? weeklyChecks :
      activeTab === "audits" ? weeklyAudits : selfChecks;

  if (!branch) {
    return (
      <ScreenWrapper>
        <Card>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900 }}>
            LC home unavailable
          </Text>
          <Text style={{ marginTop: spacing.sm, fontSize: fontSize.sm, color: colors.slate500, lineHeight: 18 }}>
            The current LC profile does not have a valid branch assignment. Please switch role or check mock data.
          </Text>
          <View style={{ marginTop: spacing.xl, alignSelf: "flex-start" }}>
            <QuickButton label="Switch role" onPress={() => setPage("profile")} variant="secondary" />
          </View>
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ marginBottom: spacing.xl, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md, flexWrap: "wrap" }}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={{ fontSize: fontSize["3xl"], fontWeight: "800", color: colors.slate900, letterSpacing: -0.5 }}>
            Branch command center
          </Text>
          <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500, lineHeight: 18 }}>
            {branch.name}, {branch.city} · {currentUser.name}
          </Text>
        </View>

        {/* Attendance Check-in Status Pill */}
        <View style={{
          backgroundColor: todayAttendanceLog ? "rgba(18,183,106,0.1)" : "rgba(245,158,11,0.1)",
          borderWidth: 1,
          borderColor: todayAttendanceLog ? "rgba(18,183,106,0.2)" : "rgba(245,158,11,0.2)",
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.lg,
          paddingVertical: 6,
          alignItems: "center"
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: "700",
            color: todayAttendanceLog ? colors.success : colors.warning
          }}>
            {todayAttendanceLog ? `Checked In: ${todayAttendanceLog.checkIn} IST` : "Check-in Pending"}
          </Text>
        </View>
      </View>

      {/* Primary actions */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl }}>
        <QuickButton label="Quick Actions" icon={Plus} onPress={() => openFormModal("quick")} variant="primary" />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
        <View style={{ width: "47%", flexGrow: 1 }}>
          <StatCard label="Health" value={pct(branch.health)} meta={`SLA ${pct(branch.sla)}`} icon={Activity} accent={colors.success} />
        </View>
        <View style={{ width: "47%", flexGrow: 1 }}>
          <StatCard label="My open Checks" value={String(myActiveTasks.length)} meta={`${myPendingTasks.length} pending`} icon={ClipboardList} accent={colors.brand} />
        </View>
        <View style={{ width: "47%", flexGrow: 1 }}>
          <StatCard label="Issues" value={String(openComplaints.length)} meta={`${branch.criticalAlerts} critical`} icon={ShieldAlert} accent={colors.warning} />
        </View>
        <View style={{ width: "47%", flexGrow: 1 }}>
          <StatCard label="Appliances" value={String(appliances.length)} meta={`${riskyAppliances.length} need review`} icon={Cpu} accent={colors.brandSecondary} />
        </View>
      </View>

      {/* Alert summary */}
      {(branch.criticalAlerts > 0 || openComplaints.length > 0 || riskyAppliances.length > 0) ? (
        <Card style={{ marginTop: spacing.xl, backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.25)" }}>
          <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}>
            <AlertTriangle size={20} color={colors.amber700} strokeWidth={2.2} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.amber700 }}>
                Attention needed
              </Text>
              <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.amber700, lineHeight: 18 }}>
                {branch.criticalAlerts} critical alerts, {openComplaints.length} open issues, and {riskyAppliances.length} appliance items need review.
              </Text>
            </View>
            <TouchableOpacity onPress={() => setPage("notifications")} style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.white }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.amber700 }}>Review</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : null}

      {/* Work queue */}
      <View style={{ marginTop: spacing["3xl"] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <View>
            <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900 }}>Action queue</Text>
            <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500 }}>
              Latest branch checks requiring LC attention
            </Text>
          </View>
          <TouchableOpacity onPress={() => setPage("tasks")}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.brand }}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Queue Tabs */}
        <View style={{ flexDirection: "row", gap: spacing.xs, marginBottom: spacing.sm }}>
          {[
            { key: "routine", label: `Weekly Checks (${weeklyChecks.length})` },
            { key: "audits", label: `Asset Audits (${weeklyAudits.length})` },
            { key: "self", label: `My To-Dos (${selfChecks.length})` }
          ].map((tab) => {
            const isTabActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: isTabActive ? colors.brand : colors.slate200,
                  backgroundColor: isTabActive ? colors.brand + "10" : colors.slate50,
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: isTabActive ? colors.brand : colors.slate500 }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Card>
          {displayTasks.slice(0, 4).map((task, index) => (
            <TouchableOpacity key={task.id} onPress={() => openTaskDetail(task.id)} activeOpacity={0.75}>
              <View style={{ paddingVertical: spacing.lg }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900 }} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500 }} numberOfLines={1}>
                      {task.zone} · {task.schedule}
                      {task.schedule === "Weekly" ? ` · ${getTimeUntilNextMonday()}` : ""}
                    </Text>
                  </View>
                  <Badge label={task.status} type={task.status} />
                </View>
              </View>
              {index < Math.min(displayTasks.length, 4) - 1 ? <View style={{ height: 1, backgroundColor: colors.slate100 }} /> : null}
            </TouchableOpacity>
          ))}
          {displayTasks.length === 0 ? (
            <Text style={{ paddingVertical: spacing.xl, textAlign: "center", fontSize: fontSize.sm, color: colors.slate500 }}>
              No active tasks in this queue.
            </Text>
          ) : null}
        </Card>
      </View>

      {/* LC Profile Career Stats */}
      <View style={{ marginTop: spacing["3xl"] }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.md }}>
          My Performance Profile
        </Text>
        <Card>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, paddingVertical: spacing.xs }}>
            <ProfileStat label="Active Shift" value={currentUser.shift || "09:00 - 18:00"} icon={Clock3} />
            <ProfileStat label="My Rating" value={(currentUser.rating || 4.0).toFixed(1) + " ★"} icon={Star} />
            <ProfileStat label="Check-in Streak" value={pct(currentUser.attendancePct || 100)} icon={CheckCircle2} />
            <ProfileStat label="Tasks Completed" value={String(currentUser.tasksClosed || 0)} icon={ClipboardList} />
          </View>
        </Card>
      </View>

      {/* Branch Snapshot (Financial & Closures) */}
      <View style={{ marginTop: spacing["3xl"] }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.md }}>
          Branch snapshot
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg }}>
          <View style={{ flex: 1, minWidth: 150 }}>
            <Card>
              <Text style={{ fontSize: fontSize.xs, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Budget used</Text>
              <Text style={{ marginTop: spacing.sm, fontSize: fontSize["3xl"], fontWeight: "800", color: colors.slate900 }}>{money(branch.usedBudget)}</Text>
              <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500 }}>of {money(branch.monthlyBudget)}</Text>
            </Card>
          </View>
          <View style={{ flex: 1, minWidth: 150 }}>
            <Card>
              <Text style={{ fontSize: fontSize.xs, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Closure rate</Text>
              <Text style={{ marginTop: spacing.sm, fontSize: fontSize["3xl"], fontWeight: "800", color: colors.slate900 }}>{pct(closureRate)}</Text>
              <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500 }}>{completedTasks.length} of {tasks.length} tasks</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Asset Sentinel Grid */}
      <View style={{ marginTop: spacing["3xl"] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <View>
            <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900 }}>Asset sentinel</Text>
            <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500 }}>
              Status tracking for branch equipment
            </Text>
          </View>
          <TouchableOpacity onPress={() => setPage("branch")}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.brand }}>View branch</Text>
          </TouchableOpacity>
        </View>

        <Card style={{ padding: spacing.sm }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {appliances.map((a) => {
              let statusColor = colors.success;
              const statusStr = a.status as string;
              if (statusStr === "Critical" || statusStr === "Down") statusColor = colors.error;
              else if (statusStr === "AtRisk" || statusStr === "At Risk") statusColor = colors.warning;

              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => openApplianceDetail(a.id)}
                  activeOpacity={0.75}
                  style={{
                    width: "48%",
                    backgroundColor: colors.slate50,
                    borderRadius: borderRadius.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.md,
                    gap: spacing.xs
                  }}
                >
                  <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.slate900 }} numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.slate500 }}>
                    {a.category} · {a.zone}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                    <Text style={{ fontSize: 10, fontWeight: "600", color: statusColor }}>
                      {statusStr === "AtRisk" || statusStr === "At Risk" ? "At Risk" : statusStr}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {appliances.length === 0 && (
              <Text style={{ flex: 1, paddingVertical: spacing.xl, textAlign: "center", fontSize: fontSize.sm, color: colors.slate500 }}>
                No appliances registered.
              </Text>
            )}
          </View>
        </Card>
      </View>

      {/* Incident / Complaint shortcut */}
      {openComplaints.length > 0 ? (
        <View style={{ marginTop: spacing["3xl"] }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.md }}>Open issues</Text>
          <Card>
            {openComplaints.slice(0, 3).map((complaint, index) => (
              <TouchableOpacity key={complaint.id} onPress={() => openComplaintDetail(complaint.id)} activeOpacity={0.75}>
                <View style={{ paddingVertical: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900 }} numberOfLines={1}>{complaint.complaintId}</Text>
                    <Text style={{ marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.slate500 }} numberOfLines={1}>{complaint.description || "No description"}</Text>
                  </View>
                  <Badge label={complaint.priority} type={complaint.priority} />
                </View>
                {index < Math.min(openComplaints.length, 3) - 1 ? <View style={{ height: 1, backgroundColor: colors.slate100 }} /> : null}
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ) : null}

      <View style={{ height: 12 }} />
    </ScreenWrapper>
  );
}

function ProfileStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<any> }) {
  return (
    <View style={{ flex: 1, minWidth: 120, gap: spacing.xs, backgroundColor: colors.slate50, padding: spacing.md, borderRadius: borderRadius.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <Icon size={14} color={colors.slate400} />
        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.slate400, textTransform: "uppercase" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate800, marginTop: 4 }}>{value}</Text>
    </View>
  );
}
