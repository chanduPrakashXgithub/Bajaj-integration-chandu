import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { ModalSheet } from "../../shared/components/ModalSheet";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  complaintId: string | number;
}

export function AcknowledgeComplaintModal({ visible, onClose, complaintId }: Props) {
  const { acknowledgeComplaint } = useApp();
  const [vendorIssueId, setVendorIssueId] = useState("");

  const handleAcknowledge = async () => {
    await acknowledgeComplaint(complaintId, vendorIssueId.trim());
    setVendorIssueId("");
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Acknowledge Complaint">
      <ScrollView style={{ padding: spacing.xl, paddingBottom: 100 }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.slate500, marginBottom: spacing.lg }}>
          Add an optional invoice or mail reference, then acknowledge this complaint.
        </Text>

        <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.slate700, marginBottom: spacing.xs }}>
              Reference ID (optional)
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.slate50, borderWidth: 1, borderColor: colors.slate200,
                borderRadius: borderRadius.lg, padding: spacing.md, fontSize: fontSize.md,
                color: colors.slate900
              }}
              placeholder="e.g. INV-10293"
              placeholderTextColor={colors.slate400}
              value={vendorIssueId}
              onChangeText={setVendorIssueId}
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ flex: 1, paddingVertical: spacing.md, alignItems: "center", borderRadius: borderRadius.lg, backgroundColor: colors.slate100 }}
          >
            <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.slate700 }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAcknowledge}
            style={{
              flex: 1, paddingVertical: spacing.md, alignItems: "center", borderRadius: borderRadius.lg,
              backgroundColor: colors.brand,
              flexDirection: "row", justifyContent: "center", gap: spacing.sm
            }}
          >
            <CheckCircle2 size={16} color={colors.white} />
            <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.white }}>Acknowledge</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalSheet>
  );
}
