import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Plug, ClipboardCheck, Phone, ChevronRight,
  ShieldCheck, ShieldAlert, Cpu,
} from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { QuickButton } from "../../shared/components/QuickButton";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius, fontWeight } from "../../theme/theme";
import { formatPct } from "../../utils/helpers";

// ── Module-scope constants ──

const BRANCH_TABS = [
  { label: "Appliances", value: "appliances" },
  { label: "Audit", value: "audit" },
] as const;

const FAB_CONFIG: Record<string, { label: string; formType: string }> = {
  appliances: { label: "Add Appliance", formType: "appliance" },
  audit: { label: "Audit Trail", formType: "audit" },
};

// ── Shared UI primitives ──

function MetricTile({ label, value, center }: { label: string; value: string; center?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: center ? "center" : undefined }}>
      <Text style={{ fontSize: 10, fontWeight: fontWeight.semibold, color: colors.slate400, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.extrabold, color: colors.slate900, marginTop: spacing.xs }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ComplianceRow({ label, value, valueColor }: { label: string; value: string; valueColor: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.slate600 }}>{label}</Text>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: valueColor }}>{value}</Text>
    </View>
  );
}

// ── Main Screen ──

export function LcBranchScreen() {
  const {
    state,
    setTab,
    currentUser,
    getBranch,
    scopedComplaints,
    scopedAppliances,
    scopedUsers,
    scopedAttendance,
    auditLog,
    openApplianceDetail,
    openFormModal,
    openAuditTrail,
  } = useApp();

  const branch = getBranch(currentUser.branchId);
  const activeTab = state.tabs.lcBranch || "appliances";

  if (!branch) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing["4xl"] }}>
          <Text style={{ fontSize: fontSize.lg, color: colors.slate500, fontWeight: "600" }}>Loading branch details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const branchStaff = useMemo(
    () => scopedUsers.filter((u) => u.branchId === branch.id && u.id !== currentUser.id),
    [scopedUsers, branch.id, currentUser.id],
  );

  const branchAssets = useMemo(
    () => scopedAppliances.filter((a) => a.branchId === branch.id),
    [scopedAppliances, branch.id],
  );

  const branchAudit = useMemo(
    () => auditLog.filter((a) => a.branchId === branch.id).slice(0, 10),
    [auditLog, branch.id],
  );

  const branchUserIdSet = useMemo(
    () => new Set(branchStaff.map((u) => u.id)),
    [branchStaff],
  );

  const branchAttendance = useMemo(
    () => scopedAttendance.filter((e) => branchUserIdSet.has(e.userId)),
    [scopedAttendance, branchUserIdSet],
  );

  const branchComplaints = useMemo(
    () => scopedComplaints.filter((c) => c.branchId === branch.id),
    [scopedComplaints, branch.id],
  );

  // Compute proof task rate from actual staff data
  const proofTaskRate = useMemo(() => {
    if (branchStaff.length === 0) return "—";
    const avg = Math.round(branchStaff.reduce((sum, u) => sum + u.proofRate, 0) / branchStaff.length);
    return formatPct(avg);
  }, [branchStaff]);

  const currentFab = FAB_CONFIG[activeTab] || FAB_CONFIG.appliances;

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Branch Hub"
        subtitle={`Operational control for ${branch.name}`}
        action={
          <View style={{ gap: spacing.md }}>
            <SegmentedControl
              tabs={[...BRANCH_TABS]}
              activeKey={activeTab}
              onChange={(v) => setTab("lcBranch", v)}
            />
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <QuickButton
                label={currentFab.label}
                icon={activeTab === "audit" ? ClipboardCheck : Plug}
                onPress={() => (activeTab === "audit" ? openAuditTrail() : openFormModal(currentFab.formType))}
                variant="primary"
              />
            </View>
          </View>
        }
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
        <View style={{ flex: 1, minWidth: 120 }}>
          <StatCard label="Appliance Risk" value={String(branch.applianceRisk)} meta="Need service" icon={ShieldAlert} accent={colors.brand} onPress={() => setTab("lcBranch", "appliances")} />
        </View>
        <View style={{ flex: 1, minWidth: 120 }}>
          {(() => {
            const operational = branchAssets.filter(a => a.status === "Operational").length;
            const atRisk = branchAssets.filter(a => a.status === "At Risk" || a.status !== "Operational").length;
            return (
              <StatCard
                label="Total Appliances"
                value={String(branchAssets.length)}
                meta={`${operational} ok · ${atRisk} flagged`}
                icon={Cpu}
                accent={colors.brand}
                onPress={() => setTab("lcBranch", "appliances")}
              />
            );
          })()}
        </View>
      </View>

      <View style={{ marginTop: spacing["3xl"] }}>
        {activeTab === "appliances" && (
          <AppliancesTab appliances={branchAssets} onAppliancePress={openApplianceDetail} />
        )}
        {activeTab === "audit" && (
          <AuditTab branch={branch} auditLog={branchAudit} attendance={branchAttendance} branchComplaints={branchComplaints} proofTaskRate={proofTaskRate} />
        )}
      </View>
    </ScreenWrapper>
  );
}

// ── Appliances Tab ──

function AppliancesTab({
  appliances,
  onAppliancePress,
}: {
  appliances: ReturnType<typeof useApp>["scopedAppliances"];
  onAppliancePress: (id: string | number) => void;
}) {
  if (appliances.length === 0) {
    return (
      <Card variant="glass">
        <Text style={{ fontSize: fontSize.sm, color: colors.slate400, textAlign: "center", paddingVertical: spacing["3xl"] }}>
          No appliances in this branch
        </Text>
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.lg }}>
      {appliances.map((app) => {
        const statusColor =
          app.status === "Operational" ? colors.success
            : app.status === "At Risk" ? colors.warning
              : colors.error;

        return (
          <Card key={app.id} variant="soft">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
                <Badge label={app.status} type={app.status} />
                <Badge
                  label={(app.approvalStatus || "").includes("Pending") ? "Pending" : "Approved"}
                  type={(app.approvalStatus || "").includes("Pending") ? "Pending" : "Approved"}
                />
              </View>
              <TouchableOpacity onPress={() => onAppliancePress(app.id)} style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.brand }}>Details</Text>
                <ChevronRight size={14} color={colors.brand} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.slate900, marginTop: spacing.lg }}>
              {app.name}
            </Text>
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.slate400, textTransform: "uppercase", letterSpacing: 1.2, marginTop: spacing.xs }}>
              {app.category} · {app.brand}
            </Text>

            <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xl }}>
              <MetricTile label="Health" value={`${app.healthScore}%`} center />
              <MetricTile label="AMC" value={(app.amcVendor || "").split(" ")[0]} center />
              <MetricTile label="Service" value={app.nextService ? String(app.nextService).slice(5, 10) : "—"} center />
              <MetricTile label="Parts" value={app.pendingParts} center />
            </View>

            <View style={{ marginTop: spacing.lg }}>
              <ProgressBar value={app.healthScore} color={statusColor} height={6} />
            </View>
          </Card>
        );
      })}
    </View>
  );
}

// ── Audit Tab ──

function AuditTab({
  branch,
  auditLog,
  attendance,
  branchComplaints,
  proofTaskRate,
}: {
  branch: ReturnType<typeof useApp>["scopedBranches"][0];
  auditLog: ReturnType<typeof useApp>["auditLog"];
  attendance: ReturnType<typeof useApp>["scopedAttendance"];
  branchComplaints: ReturnType<typeof useApp>["scopedComplaints"];
  proofTaskRate: string;
}) {
  const presentCount = attendance.filter((e) => e.status === "Present").length;
  const lateCount = attendance.filter((e) => e.status === "Late").length;
  const openIssueCount = branchComplaints.filter((c) => c.status !== "RESOLVED").length;

  return (
    <View style={{ gap: spacing.xl }}>
      <Card variant="soft">
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
          <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
            <ClipboardCheck size={16} color={colors.brand} strokeWidth={2} />
          </View>
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.slate900 }}>
            Branch Audit Trail
          </Text>
        </View>
        {auditLog.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            {auditLog.map((entry) => (
              <View key={entry.id} style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 10, fontWeight: fontWeight.extrabold, color: colors.slate400, textTransform: "uppercase", letterSpacing: 1.2 }}>
                    {entry.time}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: fontWeight.extrabold, color: colors.brand }}>
                    {entry.role.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.slate700, marginTop: spacing.sm }}>
                  {entry.text}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: fontSize.sm, color: colors.slate400, textAlign: "center", paddingVertical: spacing.xl }}>
            No audit entries yet. Actions will appear here as they happen.
          </Text>
        )}
      </Card>

      <Card variant="soft">
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
          <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.success + "15", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={16} color={colors.success} strokeWidth={2} />
          </View>
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.slate900 }}>
            Branch Compliance
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <ComplianceRow label="Geo Attendance" value={formatPct(branch.todayAttendance)} valueColor={colors.emerald600} />
          <ComplianceRow label="Proof Task Rate" value={proofTaskRate} valueColor={colors.brand} />
          <ComplianceRow label="Safety Issues" value={`${branch.criticalAlerts} Critical`} valueColor={colors.rose500} />

          <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl, marginTop: spacing.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.slate500 }}>Audit score</Text>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.slate900 }}>{formatPct(branch.auditScore)}</Text>
            </View>
            <ProgressBar
              value={branch.auditScore}
              color={branch.auditScore >= 80 ? colors.success : branch.auditScore >= 60 ? colors.warning : colors.error}
              height={10}
            />
          </View>

          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.sm }}>
            <MetricTile label="Present" value={String(presentCount)} center />
            <MetricTile label="Late" value={String(lateCount)} center />
            <MetricTile label="Open Issues" value={String(openIssueCount)} center />
          </View>
        </View>
      </Card>
    </View>
  );
}
