import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertTriangle, Info, X } from "lucide-react-native";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { useApp } from "../../context/AppContext";

interface Props {
  message?: string;
  type?: "warning" | "error" | "info";
  count?: number;
  onPress?: () => void;
  onClose?: () => void;
  onReviewAlerts?: () => void;
  onOpenAudit?: () => void;
}

const colorMap = {
  warning: { bg: "rgba(245,158,11,0.15)", text: "#92400E", border: "rgba(245,158,11,0.25)", Icon: AlertTriangle },
  error: { bg: "rgba(239,68,68,0.1)", text: "#991B1B", border: "rgba(239,68,68,0.2)", Icon: AlertTriangle },
  info: { bg: "rgba(0,91,172,0.1)", text: "#1E40AF", border: "rgba(0,91,172,0.2)", Icon: Info },
};

export function AlertStrip({ message, type = "warning", count, onPress, onClose, onReviewAlerts, onOpenAudit }: Props) {
  const { scopedBranches, scopedComplaints } = useApp();
  const criticalCount = scopedBranches.reduce((sum, b) => sum + b.criticalAlerts, 0);
  const openCount = scopedComplaints.filter((c) => c.status !== "RESOLVED").length;

  if (criticalCount === 0 && openCount === 0) return null;

  const c = colorMap[type] || colorMap.warning;
  const displayMessage = message || `${criticalCount} critical alert${criticalCount !== 1 ? "s" : ""} and ${openCount} open issue${openCount !== 1 ? "s" : ""} in current scope`;
  const displayCount = count ?? (criticalCount + openCount);

  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ marginTop: 1 }}>
          <c.Icon size={18} color={c.text} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: c.text, lineHeight: 18 }}>
            {displayMessage}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: c.text, opacity: 0.7, marginTop: 4, lineHeight: 16 }}>
            Escalation chain is active for missing proof, attendance deviations and appliance failures.
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={c.text} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      {(onReviewAlerts || onOpenAudit) && (
        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: 12 }}>
          {onReviewAlerts && (
            <TouchableOpacity
              onPress={onReviewAlerts}
              style={{
                backgroundColor: "rgba(146,64,14,0.12)",
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
              }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: c.text }}>Review alerts</Text>
            </TouchableOpacity>
          )}
          {onOpenAudit && (
            <TouchableOpacity
              onPress={onOpenAudit}
              style={{
                backgroundColor: "rgba(146,64,14,0.06)",
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: c.text }}>Open audit trail</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
