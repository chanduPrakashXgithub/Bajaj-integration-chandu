import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Stamp, ChevronRight, DollarSign, Clock, User, Building, FileText,
  CheckCircle2, XCircle, Shield, Calendar, MessageSquare, AlertTriangle
} from "lucide-react-native";
import { ScreenWrapper } from "../../../shared/layout/ScreenWrapper";
import { Card } from "../../../shared/components/Card";
import { Badge } from "../../../shared/components/Badge";
import { useApp } from "../../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../../theme/theme";
import { formatMoney } from "../../../utils/helpers";
import { Approval } from "../../../types/domain";

interface Props {
  approvalId: string;
  onBack: () => void;
}

export function ApprovalDetailScreen({ approvalId, onBack }: Props) {
  const { approvals, getBranch, getUser, approveRequest, rejectRequest, showToast } = useApp();
  const approval = approvals.find((a: Approval) => a.id === approvalId);

  if (!approval) return null;

  const branch = getBranch(approval.branchId);
  const requester = getUser(approval.requestedBy);

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={18} color={colors.text} strokeWidth={2} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, flex: 1 }}>Approval Details</Text>
      </View>

      <Card variant="soft" style={{ backgroundColor: colors.text, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
              <Badge label={approval.status} type={approval.status as any} />
              <Badge label={approval.priority} type={approval.priority} />
              <Badge label={approval.kind} type={approval.priority} />
            </View>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.white, marginTop: spacing.lg }}>{approval.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
              <Building size={14} color={colors.slate300} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, color: colors.slate300 }}>{branch?.name || "Branch " + approval.branchId}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: fontSize["4xl"], fontWeight: "400", color: colors.white }}>{formatMoney(approval.amount)}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.slate300, marginTop: spacing.xs }}>Requested amount</Text>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginBottom: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <DollarSign size={16} color={colors.brand} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{formatMoney(approval.amount)}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Amount</Text>
        </View>
        <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Clock size={16} color={colors.warning} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{approval.age}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Age</Text>
        </View>
        <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Shield size={16} color={colors.brandSecondary} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{approval.stage}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Stage</Text>
        </View>
      </View>

      <View style={{ gap: spacing.xl }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Stamp size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Request Information</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {[
              { label: "Title", value: approval.title, icon: FileText },
              { label: "Kind", value: approval.kind, icon: Stamp },
              { label: "Amount", value: formatMoney(approval.amount), icon: DollarSign },
              { label: "Priority", value: approval.priority, icon: AlertTriangle },
              { label: "Status", value: approval.status, icon: approval.status === "Approved" ? CheckCircle2 : approval.status === "Rejected" ? XCircle : Clock },
              { label: "Stage", value: approval.stage, icon: Shield },
              { label: "Age", value: approval.age, icon: Clock },
              { label: "Requested by", value: requester?.name || "Unknown", icon: User },
              { label: "Branch", value: branch?.name || "Unknown", icon: Building },
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
              <MessageSquare size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Notes</Text>
          </View>
          <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.text, lineHeight: 20 }}>{approval.note}</Text>
          </View>
        </Card>

        {approval.status === "Pending" && (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <TouchableOpacity onPress={() => approveRequest(approval.id)} style={{ backgroundColor: colors.success, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
              <CheckCircle2 size={16} color={colors.white} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => rejectRequest(approval.id)} style={{ backgroundColor: colors.error, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
              <XCircle size={16} color={colors.white} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
