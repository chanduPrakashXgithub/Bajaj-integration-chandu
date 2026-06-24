import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Send, ChevronDown, Image as ImageIcon } from "lucide-react-native";
import { ModalSheet } from "../../shared/components/ModalSheet";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { validate, complaintSchema } from "../../utils/validation";

const ASSET_SUGGESTIONS: Record<string, string[]> = {
  "AC": [
    "AC not cooling properly",
    "Water leakage from indoor unit",
    "Gas leakage issue",
    "Compressor issue",
    "Remote not working",
    "AC not powering on",
    "Abnormal noise from AC"
  ],
  "Printer": [
    "Printer offline",
    "Paper jam issue",
    "Toner replacement required",
    "Scanner not working",
    "Printing faded pages",
    "Network connectivity issue"
  ],
  "UPS": [
    "UPS not powering on",
    "Battery backup reduced",
    "Battery replacement required",
    "Continuous beeping",
    "Voltage fluctuation issue"
  ],
  "Laptop": [
    "System not booting",
    "Keyboard malfunction",
    "Battery issue",
    "Display issue",
    "Performance degradation",
    "OS crash"
  ],
  "Desktop": [
    "System not booting",
    "Keyboard malfunction",
    "Battery issue",
    "Display issue",
    "Performance degradation",
    "OS crash"
  ],
  "CCTV": [
    "No video feed",
    "Camera not recording",
    "Storage issue",
    "Network issue",
    "Night vision failure"
  ]
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function RaiseComplaintModal({ visible, onClose }: Props) {
  const { state, currentUser, scopedBranches, scopedAppliances, appliances, createComplaint, showToast } = useApp();

  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | number>("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  // Auto-select branch for LC
  useEffect(() => {
    if (state.role === "lc" && currentUser?.branchId) {
      setSelectedBranchId(currentUser.branchId);
    }
  }, [state.role, currentUser]);

  // Reset asset when branch changes
  useEffect(() => {
    setSelectedAssetId("");
  }, [selectedBranchId]);

  // Filter appliances by selected branch
  const branchAppliances = useMemo(() => {
    if (!selectedBranchId) return [];
    return appliances.filter((a) => String(a.branchId) === String(selectedBranchId));
  }, [appliances, selectedBranchId]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return appliances.find((a) => String(a.id) === String(selectedAssetId));
  }, [appliances, selectedAssetId]);

  useEffect(() => {
    if (selectedAsset) {
      setVendorName(selectedAsset.amcVendor || "");
      setVendorEmail(selectedAsset.vendorEmail || "");
      
      const category = Object.keys(ASSET_SUGGESTIONS).find(k => 
        selectedAsset.category.toLowerCase().includes(k.toLowerCase())
      );
      if (category && ASSET_SUGGESTIONS[category].length > 0) {
        setDescription(ASSET_SUGGESTIONS[category][0]);
      } else {
        setDescription("");
      }
    } else {
      setDescription("");
      setVendorName("");
      setVendorEmail("");
    }
  }, [selectedAsset]);

  const currentSuggestions = useMemo(() => {
    if (!selectedAsset?.category) return [];
    const category = Object.keys(ASSET_SUGGESTIONS).find(k => 
      selectedAsset.category.toLowerCase().includes(k.toLowerCase())
    );
    return category ? ASSET_SUGGESTIONS[category] : [];
  }, [selectedAsset]);

  const selectedBranch = useMemo(() => {
    if (!selectedBranchId) return null;
    return scopedBranches.find((b) => String(b.id) === String(selectedBranchId));
  }, [scopedBranches, selectedBranchId]);

  const handleSubmit = () => {
    const result = validate(complaintSchema, {
      assetId: String(selectedAssetId),
      priority,
      description,
    });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    createComplaint({
      branchId: selectedBranchId,
      assetId: selectedAssetId,
      priority: priority as any,
      description,
      vendorName: vendorName.trim() || undefined,
      vendorEmail: vendorEmail.trim() || undefined,
    } as any);

    // Reset
    setDescription("");
    setSelectedAssetId("");
    setPriority("Medium");
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setDescription("");
    setSelectedAssetId("");
    setPriority("Medium");
    setErrors({});
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={handleClose} title="Raise Complaint" subtitle="Report an issue with a branch asset">
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
        <View style={{ gap: spacing.xl, paddingBottom: spacing["3xl"] }}>

          {/* Branch Selection */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Branch</Text>
            {state.role === "lc" ? (
              <View style={{ borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.slate50 }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{selectedBranch?.name || "Auto-selected"}</Text>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  onPress={() => setShowBranchDropdown(!showBranchDropdown)}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: borderRadius.lg, borderWidth: 1, borderColor: errors.branchId ? colors.error : colors.border, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}
                >
                  <Text style={{ fontSize: fontSize.sm, color: selectedBranch ? colors.text : colors.textSecondary }}>
                    {selectedBranch?.name || "Select Branch"}
                  </Text>
                  <ChevronDown size={16} color={colors.slate400} />
                </TouchableOpacity>
                {showBranchDropdown && (
                  <View style={{ marginTop: spacing.xs, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, maxHeight: 200 }}>
                    <ScrollView>
                      {scopedBranches.map((b) => (
                        <TouchableOpacity
                          key={String(b.id)}
                          onPress={() => { setSelectedBranchId(b.id); setShowBranchDropdown(false); }}
                          style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}
                        >
                          <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{b.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Asset Selection */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Appliance / Asset</Text>
            <TouchableOpacity
              onPress={() => selectedBranchId ? setShowAssetDropdown(!showAssetDropdown) : showToast("Select a branch first")}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: borderRadius.lg, borderWidth: 1, borderColor: errors.assetId ? colors.error : colors.border, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}
            >
              <Text style={{ fontSize: fontSize.sm, color: selectedAsset ? colors.text : colors.textSecondary }}>
                {selectedAsset ? `${selectedAsset.name} (${selectedAsset.brand})` : "Select Asset"}
              </Text>
              <ChevronDown size={16} color={colors.slate400} />
            </TouchableOpacity>
            {errors.assetId && <Text style={{ fontSize: fontSize.xs, color: colors.error, marginTop: spacing.xs }}>{errors.assetId}</Text>}
            {showAssetDropdown && branchAppliances.length > 0 && (
              <View style={{ marginTop: spacing.xs, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, maxHeight: 200 }}>
                <ScrollView>
                  {branchAppliances.map((a) => (
                    <TouchableOpacity
                      key={String(a.id)}
                      onPress={() => { setSelectedAssetId(a.id); setShowAssetDropdown(false); }}
                      style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                      <Text style={{ fontSize: fontSize.sm, color: colors.text, fontWeight: "600" }}>{a.name}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate400 }}>{a.brand} · {a.category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {showAssetDropdown && branchAppliances.length === 0 && selectedBranchId && (
              <Text style={{ fontSize: fontSize.xs, color: colors.warning, marginTop: spacing.xs }}>No appliances found for this branch</Text>
            )}
          </View>

          {/* Vendor Details */}
          <View style={{ gap: spacing.md }}>
            <View>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Vendor Name</Text>
              <TextInput
                value={vendorName}
                onChangeText={setVendorName}
                placeholder="Enter vendor name"
                placeholderTextColor={colors.slate400}
                style={{
                  borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
                  paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
                  fontSize: fontSize.sm, color: colors.text,
                }}
              />
            </View>
            <View>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Vendor Email</Text>
              <TextInput
                value={vendorEmail}
                onChangeText={setVendorEmail}
                placeholder="vendor@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.slate400}
                style={{
                  borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
                  paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
                  fontSize: fontSize.sm, color: colors.text,
                }}
              />
            </View>
          </View>

          {/* Priority */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Priority</Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={{
                    flex: 1, alignItems: "center",
                    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
                    borderRadius: borderRadius.lg,
                    backgroundColor: priority === p ? colors.brand : colors.slate100,
                  }}
                >
                  <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: priority === p ? colors.white : colors.textSecondary }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.priority && <Text style={{ fontSize: fontSize.xs, color: colors.error, marginTop: spacing.xs }}>{errors.priority}</Text>}
          </View>

          {/* Description */}
          <View>
            <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.textSecondary, marginBottom: spacing.xs }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue — location, visible damage, and urgency"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              style={{
                borderRadius: borderRadius.lg, borderWidth: 1,
                borderColor: errors.description ? colors.error : colors.border,
                paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
                fontSize: fontSize.sm, minHeight: 100, color: colors.text,
                textAlignVertical: "top",
              }}
            />
            {currentSuggestions.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                <View style={{ flexDirection: "row", gap: spacing.sm, paddingRight: spacing.xl }}>
                  {currentSuggestions.map((s, idx) => (
                    <TouchableOpacity 
                      key={idx}
                      onPress={() => setDescription(s)}
                      style={{ 
                        paddingHorizontal: spacing.md, 
                        paddingVertical: spacing.xs, 
                        backgroundColor: colors.slate100, 
                        borderRadius: borderRadius.full,
                        borderWidth: 1,
                        borderColor: description === s ? colors.brand : colors.slate200 
                      }}
                    >
                      <Text style={{ fontSize: 12, color: description === s ? colors.brand : colors.slate600 }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            {errors.description && <Text style={{ fontSize: fontSize.xs, color: colors.error, marginTop: spacing.xs }}>{errors.description}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: colors.brand, borderRadius: borderRadius.lg,
              paddingVertical: spacing.lg, alignItems: "center",
              flexDirection: "row", justifyContent: "center", gap: spacing.sm,
            }}
          >
            <Send size={16} color={colors.white} strokeWidth={2} />
            <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.white }}>Submit Complaint</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalSheet>
  );
}
