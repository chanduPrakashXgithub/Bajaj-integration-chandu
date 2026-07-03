import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import {
  Building, Users, HardHat, TrendingUp, DollarSign, Activity,
  AlertCircle, TriangleAlert, ShieldCheck, Clock, CalendarDays, MapPin,
  Phone, Mail, ChevronRight, Wrench, Zap,
  Camera, XCircle, FileText
} from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { Badge } from "../../shared/components/Badge";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { DatePickerDropdown } from "../../shared/components/DatePickerDropdown";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { formatPct, formatMoney } from "../../utils/helpers";
import { Branch, User, Task, Complaint, Appliance, AttendanceLog, ComplaintStatus } from "../../types/domain";
import { StaffDetailScreen } from "../../shared/components/detail/StaffDetailScreen";

interface Props {
  branch: Branch;
  onBack: () => void;
}

type TabKey = "overview" | "staff" | "appliances" | "issues" | "info";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "staff", label: "Staff" },
  { key: "appliances", label: "Appliances" },
  { key: "issues", label: "Issues" },
  { key: "info", label: "Info" },
];

export function BranchDeepDiveScreen({ branch, onBack }: Props) {
  const { scopedUsers, scopedTasks, scopedComplaints, scopedAppliances, scopedAttendance, openApplianceDetail, openTaskDetail, openComplaintDetail, users } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [applianceFromDate, setApplianceFromDate] = useState("");
  const [applianceToDate, setApplianceToDate] = useState("");

  if (selectedUserId) {
    return (
      <StaffDetailScreen
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  const branchUsers = scopedUsers.filter((u: User) => u.branchId === branch.id);
  const branchTasks = scopedTasks.filter((t: Task) => t.branchId === branch.id);
  const branchComplaints = scopedComplaints.filter((c: Complaint) => c.branchId === branch.id);
  const branchAppliances = scopedAppliances.filter((a: Appliance) => a.branchId === branch.id);
  const branchAttendance = scopedAttendance.filter((a: AttendanceLog) => {
    const user = scopedUsers.find((u: User) => u.id === a.userId);
    return user?.branchId === branch.id;
  });

  const budgetPct = Math.round((branch.usedBudget / branch.monthlyBudget) * 100);
  const workers = branchUsers.filter((u: User) => u.role === "lc");
  const employees = branchUsers.filter((u: User) => u.role !== "lc" && u.role !== "rm" && u.role !== "branchManager");
  const pendingTasks = branchTasks.filter((t) => t.status === "Pending").length;
  const openComplaints = branchComplaints.filter((c) => c.status !== "RESOLVED").length;
  const criticalAppliances = branchAppliances.filter((a) => a.status === "Critical" || a.status === "Down").length;
  const todayPresent = branchAttendance.filter((a) => a.status === "Present").length;
  const todayTotal = branchAttendance.length || 1;

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }}>
          <ChevronRight size={16} color={colors.slate700} strokeWidth={2.5} style={{ transform: [{ rotate: "180deg" }] }} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.slate700 }}>Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>{branch.code}</Text>
          <Text style={{ fontSize: fontSize["4xl"], fontWeight: "800", color: colors.slate900, letterSpacing: -0.5, marginTop: 2 }}>{branch.name}</Text>
        </View>
        <Badge label={branch.health >= 90 ? "Healthy" : "Watch"} type={branch.health >= 90 ? "Completed" : "High"} />
      </View>

      <View style={{ flexDirection: "row", backgroundColor: colors.slate100, borderRadius: 999, padding: 3, marginBottom: spacing["3xl"] }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ flex: 1, borderRadius: 999, paddingVertical: spacing.sm, alignItems: "center", backgroundColor: active ? colors.slate900 : "transparent" }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: active ? "700" : "600", color: active ? colors.white : colors.slate500 }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing["3xl"], paddingBottom: 40 }}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "staff" && renderStaff()}
        {activeTab === "appliances" && renderAppliances()}
        {activeTab === "issues" && renderIssues()}
        {activeTab === "info" && renderInfo()}
      </ScrollView>
    </ScreenWrapper>
  );

  function renderOverview() {
    return (
      <>
        <View style={{ backgroundColor: colors.slate900, borderRadius: 28, padding: spacing["2xl"] }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
            {[
              { label: "Health", value: formatPct(branch.health), icon: Activity, color: colors.success },
              { label: "Attendance", value: formatPct(branch.todayAttendance), icon: Users, color: colors.brandSecondary },
              { label: "SLA", value: formatPct(branch.sla), icon: Clock, color: colors.info },
              { label: "Performance", value: formatPct(branch.performance), icon: TrendingUp, color: colors.success },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, minWidth: 70, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: spacing.md, alignItems: "center" }}>
                <s.icon size={14} color={s.color} strokeWidth={2.5} />
                <Text style={{ fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.sm }}>{s.label}</Text>
                <Text style={{ fontSize: fontSize.lg, fontWeight: "800", color: s.color, letterSpacing: -0.3, marginTop: spacing.xs }}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {[
            { label: "Staff", value: String(branch.staffCount), meta: `${branch.staffCount} total`, accent: colors.brandSecondary, icon: Users },
            { label: "Open Issues", value: String(openComplaints), meta: `${branch.criticalAlerts} critical`, accent: colors.error, icon: AlertCircle },
            { label: "Pending Tasks", value: String(pendingTasks), meta: `of ${branchTasks.length} total`, accent: colors.warning, icon: FileText },
            { label: "Budget Used", value: formatPct(budgetPct), meta: `of ${formatMoney(branch.monthlyBudget)}`, accent: colors.brand, icon: DollarSign },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, minWidth: 100, backgroundColor: colors.card, borderRadius: 24, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: s.accent + "15", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={14} color={s.accent} strokeWidth={2.5} />
                </View>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.slate900, letterSpacing: -0.5, marginTop: spacing.sm }}>{s.value}</Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.slate500, marginTop: 2 }}>{s.meta}</Text>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.lg }}>Revenue & Footfall</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
            {[
              { label: "Revenue Index", value: String(branch.revenueIndex), meta: "vs regional avg", icon: TrendingUp, color: colors.success },
              { label: "Customer Footfall", value: String(branch.customerFootfall), meta: "Daily average", icon: Users, color: colors.brandSecondary },
              { label: "Audit Score", value: formatPct(branch.auditScore), meta: "Compliance rating", icon: ShieldCheck, color: colors.info },
              { label: "Present Today", value: `${todayPresent}/${todayTotal}`, meta: "Staff on floor", icon: Camera, color: colors.brand },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, minWidth: 100, backgroundColor: colors.slate50, borderRadius: 20, padding: spacing.xl }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <s.icon size={14} color={s.color} strokeWidth={2.5} />
                  <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: colors.slate900, letterSpacing: -0.5, marginTop: spacing.sm }}>{s.value}</Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.slate500, marginTop: 2 }}>{s.meta}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.lg }}>Budget Tracker</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>Used: {formatMoney(branch.usedBudget)}</Text>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.slate900 }}>{formatMoney(branch.monthlyBudget)}</Text>
          </View>
          <ProgressBar value={budgetPct} color={budgetPct > 85 ? colors.error : budgetPct > 70 ? colors.warning : colors.success} height={12} />
          <Text style={{ fontSize: fontSize.sm, color: colors.slate500, marginTop: spacing.sm }}>{budgetPct}% utilised · {formatMoney(branch.monthlyBudget - branch.usedBudget)} remaining</Text>
        </View>
      </>
    );
  }

  function renderStaff() {
    const allStaff = [...workers, ...employees];
    return (
      <>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.xs }}>
          {[
            { label: "Workers", value: String(branch.workerCount), icon: HardHat, color: colors.brandSecondary },
            { label: "Total staff", value: String(branch.staffCount), icon: Users, color: colors.brand },
            { label: "Present", value: String(todayPresent), icon: Users, color: colors.success },
            { label: "Away", value: String(todayTotal - todayPresent), icon: Clock, color: colors.warning },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, minWidth: 70, backgroundColor: colors.card, borderRadius: 20, padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
              <s.icon size={16} color={s.color} strokeWidth={2.5} />
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.slate900, letterSpacing: -0.5, marginTop: spacing.xs }}>{s.value}</Text>
              <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: spacing.md }}>
          {allStaff.length === 0 ? (
            <Text style={{ fontSize: fontSize.sm, color: colors.slate500, textAlign: "center", paddingVertical: 60 }}>No staff data</Text>
          ) : allStaff.map((user: User) => {
            return (
              <TouchableOpacity key={user.id} onPress={() => setSelectedUserId(user.id)} activeOpacity={0.7} style={{ backgroundColor: colors.card, borderRadius: 24, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: "700", color: colors.slate900 }}>{user.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900 }}>{user.name}</Text>
                      <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{user.position}</Text>
                    </View>
                    <Badge label={user.status} type={user.status} />
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.md }}>
                  {[
                    { label: "Attendance", value: formatPct(user.attendancePct), color: colors.brandSecondary },
                    { label: "Tasks", value: String(user.tasksClosed), color: colors.success },
                    { label: "Proof", value: formatPct(user.proofRate), color: colors.info },
                  ].map((m) => (
                    <View key={m.label} style={{ flex: 1, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>{m.label}</Text>
                      <Text style={{ fontSize: fontSize.md, fontWeight: "800", color: m.color, marginTop: spacing.xs }}>{m.value}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  }

  function renderAppliances() {
    const applianceTasks = (id: string | number) => scopedTasks.filter(t => String(t.applianceId) === String(id) && t.proofUrl);
    const filteredApplianceTasks = (id: string | number) => {
      let tasks = applianceTasks(id);
      if (applianceFromDate) tasks = tasks.filter(t => t.completedAt && String(t.completedAt).slice(0, 10) >= applianceFromDate);
      if (applianceToDate) tasks = tasks.filter(t => t.completedAt && String(t.completedAt).slice(0, 10) <= applianceToDate);
      return tasks;
    };
    return (
      <View style={{ gap: spacing.md }}>
        {criticalAppliances > 0 && (
          <View style={{ backgroundColor: colors.rose50, borderRadius: 20, padding: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <TriangleAlert size={18} color={colors.rose600} strokeWidth={2.5} />
            <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.rose700, flex: 1 }}>{criticalAppliances} appliance(s) need immediate attention</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm }}>
          <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <DatePickerDropdown value={applianceFromDate} onChange={setApplianceFromDate} placeholder="From date" />
          </View>
          <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <DatePickerDropdown value={applianceToDate} onChange={setApplianceToDate} placeholder="To date" />
          </View>
        </View>

        {branchAppliances.length === 0 ? (
          <Text style={{ fontSize: fontSize.sm, color: colors.slate500, textAlign: "center", paddingVertical: 60 }}>No appliances registered</Text>
        ) : branchAppliances.map((app) => {
          const relatedTasks = filteredApplianceTasks(app.id);
          return (
          <TouchableOpacity
            key={app.id}
            onPress={() => openApplianceDetail(app.id)}
            activeOpacity={0.7}
            style={{ backgroundColor: colors.card, borderRadius: 24, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: app.status === "Operational" ? colors.emerald50 : app.status === "At Risk" ? colors.amber50 : colors.rose50, alignItems: "center", justifyContent: "center" }}>
                  {app.status === "Operational" ? <Zap size={16} color={colors.emerald600} strokeWidth={2.5} /> : app.status === "At Risk" ? <TriangleAlert size={16} color={colors.amber700} strokeWidth={2.5} /> : <XCircle size={16} color={colors.rose600} strokeWidth={2.5} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900 }}>{app.name}</Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{app.category} · {app.zone}</Text>
                </View>
              </View>
              <Badge label={app.status} type={app.status} />
            </View>
            {app.imageUrl ? (
              <View style={{ marginBottom: spacing.md, borderRadius: 20, overflow: "hidden", height: 160 }}>
                <Image source={{ uri: app.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              </View>
            ) : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
              <View style={{ flex: 1, minWidth: 60, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Health</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "800", color: app.healthScore >= 80 ? colors.success : app.healthScore >= 60 ? colors.warning : colors.error, marginTop: spacing.xs }}>{formatPct(app.healthScore)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 60, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Brand</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, marginTop: spacing.xs }}>{app.brand}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 60, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Service</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, marginTop: spacing.xs }}>{app.nextService}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 60, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Parts</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, marginTop: spacing.xs }}>{app.pendingParts === "None" ? "—" : app.pendingParts}</Text>
              </View>
            </View>

            {relatedTasks.length > 0 ? (
              <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.slate100, paddingTop: spacing.md }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm }}>Completed Tasks ({relatedTasks.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                  {relatedTasks.map(rt => (
                    <TouchableOpacity key={rt.id} onPress={() => openTaskDetail(rt.id)} activeOpacity={0.7} style={{ width: 150, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
                      <Image source={{ uri: rt.proofUrl! }} style={{ width: "100%", height: 110 }} resizeMode="cover" />
                      <View style={{ padding: spacing.sm }}>
                        <Text style={{ fontSize: fontSize.xs, fontWeight: "700", color: colors.slate900 }} numberOfLines={1}>{rt.title}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <CalendarDays size={10} color={colors.slate500} strokeWidth={2.5} />
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>{rt.completedAt ? String(rt.completedAt).slice(0, 10) : "No date"}</Text>
                        </View>
                        {rt.notes ? <Text style={{ fontSize: fontSize.xs, color: colors.slate500, marginTop: 2 }} numberOfLines={1}>{rt.notes}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </TouchableOpacity>
        )})}
      </View>
    );
  }

  function renderIssues() {
    const statusConfig: Record<ComplaintStatus, { label: string; color: string; bg: string; icon: any; progress: number }> = {
      OPEN: { label: "Open", color: colors.amber700, bg: colors.amber50, icon: AlertCircle, progress: 15 },
      VENDOR_PENDING: { label: "Vendor Pending", color: colors.sky600, bg: colors.sky50, icon: Clock, progress: 30 },
      IN_PROGRESS: { label: "In Progress", color: colors.brandSecondary, bg: colors.brandLight, icon: Activity, progress: 50 },
      ON_HOLD: { label: "On Hold", color: colors.orange600, bg: colors.orange50, icon: Clock, progress: 40 },
      RESOLVED: { label: "Resolved", color: colors.emerald600, bg: colors.emerald50, icon: ShieldCheck, progress: 100 },
      REOPENED: { label: "Reopened", color: colors.rose600, bg: colors.rose50, icon: AlertCircle, progress: 15 },
      ACKNOWLEDGED: { label: "Acknowledged", color: colors.info, bg: colors.brandLight, icon: Activity, progress: 20 },
    };
    return (
      <View style={{ gap: spacing.md }}>
        {branchComplaints.length === 0 ? (
          <Text style={{ fontSize: fontSize.sm, color: colors.slate500, textAlign: "center", paddingVertical: 60 }}>No issues reported</Text>
        ) : branchComplaints.map((c) => {
          const cfg = statusConfig[c.status] || statusConfig.OPEN;
          const Icon = cfg.icon;
          return (
          <TouchableOpacity key={c.id} onPress={() => openComplaintDetail(c.id)} activeOpacity={0.7} style={{ backgroundColor: colors.card, borderRadius: 24, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
              <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                <Icon size={16} color={cfg.color} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, flex: 1 }} numberOfLines={1}>{c.complaintId}</Text>
                  <Badge label={cfg.label} type={c.status === "RESOLVED" ? "Completed" : c.priority} />
                </View>
                <Text style={{ fontSize: fontSize.sm, color: colors.slate500, marginTop: spacing.xs }} numberOfLines={2}>{c.description}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md }}>
              <View style={{ flex: 1, minWidth: 70, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Priority</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: c.priority === "Critical" ? colors.error : c.priority === "High" ? colors.warning : colors.slate900, marginTop: spacing.xs }}>{c.priority}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 70, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Vendor</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, marginTop: spacing.xs }} numberOfLines={1}>{c.vendorId || "—"}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 70, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>Asset</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, marginTop: spacing.xs }} numberOfLines={1}>{c.assetName || "—"}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>Opened {String(c.createdAt).slice(0, 10)}</Text>
              <View style={{ flex: 1, marginLeft: spacing.md }}><ProgressBar value={cfg.progress} color={cfg.color} height={6} /></View>
            </View>
          </TouchableOpacity>
        )})}
      </View>
    );
  }

  function renderInfo() {
    const branchLc = (users || []).find(u => u.role === "lc" && String(u.branchId) === String(branch.id));
    const branchAa = (users || []).find(u => u.role === "aa" && u.branchScope?.map(String).includes(String(branch.id)));
    const branchAm = (users || []).find(u => u.role === "branchManager" && u.branchScope?.map(String).includes(String(branch.id)));

    return (
      <View style={{ gap: spacing.md }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.lg }}>Branch Details</Text>
          <View style={{ gap: spacing.md }}>
            {[
              { label: "Code", value: branch.code, icon: Building },
              { label: "Address", value: branch.address, icon: MapPin },
              { label: "Phone", value: branch.phone, icon: Phone },
              { label: "Email", value: branch.email, icon: Mail },
              { label: "City", value: branch.city, icon: MapPin },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: 14, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.slate500} strokeWidth={2.5} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{row.label}</Text>
                </View>
                <Text numberOfLines={1} style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.slate900, maxWidth: 200 }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.lg }}>Key Staff Assignments</Text>
          <View style={{ gap: spacing.md }}>
            {[
              { label: "Branch Manager (AM)", value: branchAm ? `${branchAm.name} (${branchAm.email || "No email"})` : "Unassigned", icon: Users },
              { label: "Admin Assistant (AA)", value: branchAa ? `${branchAa.name} (${branchAa.email || "No email"})` : "Unassigned", icon: Users },
              { label: "Local Coordinator (LC)", value: branchLc ? `${branchLc.name} (${branchLc.email || "No email"})` : "Unassigned", icon: Users },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: 14, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.slate500} strokeWidth={2.5} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{row.label}</Text>
                </View>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.slate900 }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.lg }}>Operations</Text>
          <View style={{ gap: spacing.md }}>
            {[
              { label: "Shift Window", value: branch.shiftWindow, icon: Clock },
              { label: "Geo Radius", value: `${branch.geoRadius}m`, icon: MapPin },
              { label: "Last Visit", value: branch.lastVisit, icon: CalendarDays },
              { label: "Next Visit", value: branch.nextVisit, icon: CalendarDays },
              { label: "Staff Count", value: String(branch.staffCount), icon: Users },
              { label: "Open Issues", value: String(branch.openIssues), icon: AlertCircle },
              { label: "Critical Alerts", value: String(branch.criticalAlerts), icon: TriangleAlert },
              { label: "Appliance Risk", value: String(branch.applianceRisk), icon: Wrench },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: 14, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.slate500} strokeWidth={2.5} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{row.label}</Text>
                </View>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: colors.slate900 }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {branchComplaints.length > 0 && (
          <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color: colors.slate900, marginBottom: spacing.lg }}>Recent Issues</Text>
            {branchComplaints.slice(0, 4).map((c) => (
              <TouchableOpacity key={c.id} onPress={() => openComplaintDetail(c.id)} style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.slate50, borderRadius: 14, padding: spacing.md }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.status === "RESOLVED" ? colors.success : colors.warning, marginTop: 4 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>{c.complaintId}</Text>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.slate900, marginTop: 2 }} numberOfLines={1}>{c.description}</Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.slate500, marginTop: 2 }}>{String(c.createdAt).slice(0, 10)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }
}
