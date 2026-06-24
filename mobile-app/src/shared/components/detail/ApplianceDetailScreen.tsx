import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Wrench, ChevronRight, MapPin, Calendar, Shield, DollarSign,
  AlertTriangle, CheckCircle2, XCircle, Clock, Building, Tag,
  Truck, FileText
} from "lucide-react-native";
import { ScreenWrapper } from "../../../shared/layout/ScreenWrapper";
import { Card } from "../../../shared/components/Card";
import { Badge } from "../../../shared/components/Badge";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { useApp } from "../../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../../theme/theme";
import { formatMoney } from "../../../utils/helpers";

interface Props {
  applianceId: string;
  onBack: () => void;
}

export function ApplianceDetailScreen({ applianceId, onBack }: Props) {
  const { getAppliance, getBranch } = useApp();
  const appliance = getAppliance(applianceId);

  if (!appliance) return null;

  const branch = getBranch(appliance.branchId);
  const healthColor = appliance.healthScore >= 80 ? colors.success : appliance.healthScore >= 60 ? colors.warning : colors.error;

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={18} color={colors.text} strokeWidth={2} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, flex: 1 }}>Asset Details</Text>
      </View>

      <Card variant="soft" style={{ backgroundColor: colors.text, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.brand + "30", alignItems: "center", justifyContent: "center" }}>
                <Wrench size={18} color={colors.brand} strokeWidth={2} />
              </View>
              <Badge label={appliance.status} type={appliance.status as any} />
            </View>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.white, marginTop: spacing.lg }}>{appliance.name}</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.slate300, marginTop: spacing.xs }}>{appliance.category} | {appliance.zone}</Text>
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: healthColor + "30", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: healthColor === colors.success ? colors.emerald200 : healthColor === colors.warning ? colors.amber200 : colors.rose200 }}>{appliance.healthScore}%</Text>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginBottom: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Shield size={16} color={colors.brand} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{appliance.healthScore}%</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Health</Text>
        </View>
        <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <DollarSign size={16} color={colors.warning} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{formatMoney(appliance.purchaseCost)}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Cost</Text>
        </View>
        <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Calendar size={16} color={colors.success} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{appliance.warranty}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Warranty</Text>
        </View>
      </View>

      <View style={{ gap: spacing.xl }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Wrench size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Asset Information</Text>
          </View>
          <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Health score</Text>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{appliance.healthScore}%</Text>
            </View>
            <ProgressBar value={appliance.healthScore} color={healthColor} />
          </View>
          <View style={{ gap: spacing.sm }}>
            {[
              { label: "Brand", value: appliance.brand, icon: Tag },
              { label: "Model", value: appliance.model, icon: Wrench },
              { label: "Serial", value: appliance.serial, icon: Tag },
              { label: "Category", value: appliance.category, icon: Building },
              { label: "Zone", value: appliance.zone, icon: MapPin },
              { label: "Branch", value: branch?.name || "Unknown", icon: Building },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{row.label}</Text>
                </View>
                <Text numberOfLines={1} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 180 }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Service History</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {[
              { label: "Purchase date", value: appliance.purchaseDate, icon: Calendar },
              { label: "Last service", value: appliance.lastService, icon: Wrench },
              { label: "Next service", value: appliance.nextService, icon: Clock },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{row.label}</Text>
                </View>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Truck size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Vendor & Maintenance</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Truck size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>AMC vendor</Text>
              </View>
              <Text numberOfLines={1} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 160 }}>{appliance.amcVendor}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <FileText size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Approval status</Text>
              </View>
              <Text numberOfLines={1} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 160 }}>{appliance.approvalStatus}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Wrench size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Pending parts</Text>
              </View>
              <Text numberOfLines={1} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 160 }}>{appliance.pendingParts}</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
