import React from "react";
import { View, Text, ScrollView } from "react-native";
import { History, Activity, FileText, CheckCircle, AlertTriangle, RefreshCw, Plus, Wrench, DollarSign, Calendar, UserPlus, Edit, Settings, Zap, XCircle } from "lucide-react-native";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { ModalSheet } from "../../shared/components/ModalSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  Activity, FileText, CheckCircle, AlertTriangle, RefreshCw, Plus, Wrench,
  DollarSign, Calendar, UserPlus, Edit, Settings, Zap, XCircle, History,
};

const defaultEntries = [
  { time: "11:01", text: "System initialized with mock data snapshot.", icon: Activity, color: colors.info },
  { time: "10:18", text: "Expense request 402 routed to manager queue.", icon: FileText, color: colors.brandSecondary },
  { time: "09:36", text: "Complaint 201 updated with probable low gas diagnosis.", icon: CheckCircle, color: colors.success },
  { time: "08:05", text: "Critical safety complaint 205 created from patrol proof.", icon: AlertTriangle, color: colors.error },
  { time: "07:30", text: "Branch health score recalculated for 3 branches.", icon: Activity, color: colors.info },
  { time: "06:45", text: "Daily attendance snapshot generated.", icon: History, color: colors.textSecondary },
];

export function AuditTrailModal({ visible, onClose }: Props) {
  const { auditLog } = useApp();

  const allEntries = [
    ...auditLog.map((entry) => ({
      time: entry.time,
      text: entry.text,
      icon: iconMap[entry.icon] || Activity,
      color: entry.color,
    })),
    ...defaultEntries,
  ];

  const subtitle = auditLog.length > 0
    ? `${auditLog.length} actions tracked in this session`
    : "Recent system actions, approvals and proof-based movements";

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Audit trail" subtitle={subtitle}>
      <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: spacing.md }}>
        {allEntries.length > 0 ? allEntries.map((entry, i) => (
          <View key={i} style={{ flexDirection: "row", gap: spacing.lg, backgroundColor: colors.slate50, borderRadius: borderRadius.xl, padding: spacing.xl }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: entry.color + "15", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
              <entry.icon size={16} color={entry.color} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{entry.time}</Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>{entry.text}</Text>
            </View>
          </View>
        )) : (
          <View style={{ alignItems: "center", padding: spacing["4xl"] }}>
            <History size={32} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.lg }}>No audit entries yet</Text>
          </View>
        )}
      </ScrollView>
    </ModalSheet>
  );
}
