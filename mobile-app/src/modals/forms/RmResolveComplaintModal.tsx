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

export function RmResolveComplaintModal({ visible, onClose, complaintId }: Props) {
  const { updateComplaintStatus } = useApp();
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [vendorRemarks, setVendorRemarks] = useState("");
  const [costIncurred, setCostIncurred] = useState("");

  const handleResolve = () => {
    if (!resolutionNotes.trim()) return;
    
    let finalVendorRemarks = vendorRemarks.trim();
    if (costIncurred.trim()) {
      finalVendorRemarks += `\nCost Incurred: ₹${costIncurred}`;
    }

    updateComplaintStatus(complaintId, "RESOLVED", resolutionNotes, finalVendorRemarks);
    setResolutionNotes("");
    setVendorRemarks("");
    setCostIncurred("");
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Resolve Complaint" subtitle="Mark this complaint as resolved">
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
        <View style={{ gap: spacing.xl, paddingBottom: spacing["3xl"] }}>
          
          {/* Resolution Notes */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Resolution Notes (Required)</Text>
            <TextInput
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholder="e.g. Gas leakage repaired. Cooling restored successfully."
              placeholderTextColor={colors.slate400}
              multiline
              numberOfLines={4}
              style={{
                borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
                paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
                fontSize: fontSize.sm, minHeight: 100, color: colors.text,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Vendor Remarks */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Vendor Remarks (Optional)</Text>
            <TextInput
              value={vendorRemarks}
              onChangeText={setVendorRemarks}
              placeholder="Any remarks from the vendor..."
              placeholderTextColor={colors.slate400}
              multiline
              numberOfLines={3}
              style={{
                borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
                paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
                fontSize: fontSize.sm, minHeight: 80, color: colors.text,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Cost Incurred */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Cost Incurred (Optional)</Text>
            <TextInput
              value={costIncurred}
              onChangeText={setCostIncurred}
              placeholder="e.g. 1500"
              keyboardType="numeric"
              placeholderTextColor={colors.slate400}
              style={{
                borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
                paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
                fontSize: fontSize.sm, color: colors.text,
              }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleResolve}
            disabled={!resolutionNotes.trim()}
            style={{
              backgroundColor: resolutionNotes.trim() ? colors.success : colors.slate300,
              borderRadius: borderRadius.lg, paddingVertical: spacing.lg,
              alignItems: "center", flexDirection: "row", justifyContent: "center", gap: spacing.sm,
            }}
          >
            <CheckCircle2 size={16} color={colors.white} strokeWidth={2} />
            <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.white }}>Resolve Complaint</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalSheet>
  );
}
