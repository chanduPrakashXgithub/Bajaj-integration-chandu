import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Building, TrendingUp, Users, Clock, AlertCircle, TriangleAlert, ShieldCheck, DollarSign, ChevronRight } from "lucide-react-native";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { Branch } from "../../types/domain";

interface Props {
  branch: Branch;
  onOverview?: () => void;
  onDeepDive?: () => void;
  onScheduleVisit?: () => void;
  showRevenueIndex?: boolean;
}

export function BranchCard({ branch, onOverview, onDeepDive, onScheduleVisit, showRevenueIndex }: Props) {
  const budgetPct = Math.round((branch.usedBudget / branch.monthlyBudget) * 100);
  const healthy = branch.health >= 90;

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["6xl"], borderWidth: 1, borderColor: colors.border, padding: spacing["2xl"] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 2 }}>{branch.code}</Text>
          <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{branch.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{branch.address}</Text>
            {showRevenueIndex ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.slate50, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md }}>
                <TrendingUp size={10} color={colors.textSecondary} />
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>RevIdx {branch.revenueIndex}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Badge label={healthy ? "Healthy" : "Watch"} type={healthy ? "Completed" : "High"} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 80 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Attendance</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{branch.todayAttendance}%</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Open issues</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{branch.openIssues}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Budget used</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{budgetPct}%</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Next visit</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{branch.nextVisit}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80 }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Audit</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{branch.auditScore}%</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <ProgressBar value={branch.health} color={branch.health >= 90 ? colors.success : branch.health >= 80 ? colors.warning : colors.error} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 60, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <TrendingUp size={12} color={colors.brandSecondary} />
          <View>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Performance</Text>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{branch.performance}%</Text>
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 60, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <ShieldCheck size={12} color={colors.success} />
          <View>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Staff</Text>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{branch.staffCount} ({branch.workerCount}W, {branch.staffCount - branch.workerCount}E)</Text>
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 60, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <AlertCircle size={12} color={colors.error} />
          <View>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Critical</Text>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.error }}>{branch.criticalAlerts}</Text>
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 60, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <TriangleAlert size={12} color={colors.warning} />
          <View>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Appliance risk</Text>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.warning }}>{branch.applianceRisk}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        {onOverview ? (
          <TouchableOpacity onPress={onOverview} style={{ backgroundColor: colors.card, borderRadius: borderRadius["2xl"], paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.textSecondary }}>Branch Deep Dive</Text>
          </TouchableOpacity>
        ) : null}
        {onDeepDive ? (
          <TouchableOpacity onPress={onDeepDive} style={{ backgroundColor: colors.text, borderRadius: borderRadius["2xl"], paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Deep Dive</Text>
            <ChevronRight size={14} color={colors.white} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}

      </View>
    </View>
  );
}
