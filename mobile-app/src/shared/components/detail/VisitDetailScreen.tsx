import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Route, ChevronRight, MapPin, Clock, Calendar, CheckCircle2, AlertTriangle,
  FileText, User, Send, Building
} from "lucide-react-native";
import { ScreenWrapper } from "../../../shared/layout/ScreenWrapper";
import { Card } from "../../../shared/components/Card";
import { Badge } from "../../../shared/components/Badge";
import { useApp } from "../../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../../theme/theme";
import { Visit } from "../../../types/domain";

interface Props {
  visitId: string;
  onBack: () => void;
}

export function VisitDetailScreen({ visitId, onBack }: Props) {
  const { visits, getBranch, submitVisitReport, showToast } = useApp();
  const visit = visits.find((v: Visit) => v.id === visitId);

  if (!visit) return null;

  const branch = getBranch(visit.branchId);

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={18} color={colors.text} strokeWidth={2} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, flex: 1 }}>Visit Details</Text>
      </View>

      <Card variant="soft" style={{ backgroundColor: colors.text, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
              <Badge label={visit.status} type={visit.status as any} />
            </View>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.white, marginTop: spacing.lg }}>{visit.purpose}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
              <MapPin size={14} color={colors.slate300} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, color: colors.slate300 }}>{branch?.name || "Branch " + visit.branchId}</Text>
            </View>
          </View>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: visit.status === "Completed" ? colors.emerald500 + "30" : visit.status === "Escalated" ? colors.rose500 + "30" : colors.brand + "30", alignItems: "center", justifyContent: "center" }}>
            {visit.status === "Completed" ? <CheckCircle2 size={24} color={colors.emerald200} strokeWidth={2} /> : visit.status === "Escalated" ? <AlertTriangle size={24} color={colors.rose200} strokeWidth={2} /> : <Route size={24} color={colors.brandLight} strokeWidth={2} />}
          </View>
        </View>
      </Card>

      <View style={{ gap: spacing.xl }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Visit Information</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {[
              { label: "Branch", value: branch?.name || "Unknown", icon: Building },
              { label: "Scheduled", value: visit.scheduledAt, icon: Calendar },
              { label: "Purpose", value: visit.purpose, icon: Route },
              { label: "Status", value: visit.status, icon: visit.status === "Completed" ? CheckCircle2 : AlertTriangle },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{row.label}</Text>
                </View>
                <Text numberOfLines={2} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 180, textAlign: "right" }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Agenda</Text>
          </View>
          <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.text, lineHeight: 20 }}>{visit.agenda}</Text>
          </View>
        </Card>

        {visit.status === "Completed" && visit.report !== "Pending" && (
          <Card variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.success + "15", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Visit Report</Text>
            </View>
            <View style={{ backgroundColor: colors.emerald50, borderRadius: borderRadius.lg, padding: spacing.xl, flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
              <CheckCircle2 size={16} color={colors.emerald700} strokeWidth={2} style={{ marginTop: 2 }} />
              <Text style={{ fontSize: fontSize.sm, color: colors.emerald700, flex: 1, lineHeight: 20 }}>{visit.report}</Text>
            </View>
          </Card>
        )}

        {(visit.status === "Scheduled" || visit.status === "Escalated") && (
          <TouchableOpacity onPress={() => submitVisitReport(visit.id)} style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
            <Send size={16} color={colors.white} strokeWidth={2} />
            <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Submit Visit Report</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenWrapper>
  );
}
