import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stamp, CheckCircle, XCircle, Clock, DollarSign, Building, AlertCircle, Layers } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { formatMoney } from "../../utils/helpers";

function TouchableChip({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1 },
        isSelected
          ? { backgroundColor: colors.brand, borderColor: colors.brand }
          : { backgroundColor: colors.white, borderColor: colors.border },
      ]}
    >
      <Text
        style={[
          { fontSize: fontSize.sm, fontWeight: "500" },
          isSelected ? { color: colors.white } : { color: colors.slate700 },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function RmApprovalsScreen() {
  const { state, setTab, scopedApprovals, approveRequest, rejectRequest, scopedBranches, showToast } = useApp();
  const filter = state.tabs.approvals || "pending";

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("");

  useEffect(() => {
    setSelectedBranchId("");
  }, [selectedRegion]);

  const uniqueRegions = useMemo(() => {
    const regions = scopedBranches.map((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") return "Chhattisgarh";
      return r;
    }).filter((c) => c && c !== "Pending");
    return Array.from(new Set(regions)).sort();
  }, [scopedBranches]);

  const branchesInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    if (selectedRegion === "all") return scopedBranches;
    return scopedBranches.filter((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") r = "Chhattisgarh";
      return r === selectedRegion;
    });
  }, [scopedBranches, selectedRegion]);

  const list = useMemo(() => {
    if (!selectedRegion || selectedBranchId === "") return [];

    const activeBranchIds = selectedBranchId !== "all"
      ? [selectedBranchId]
      : branchesInRegion.map(b => b.id);

    return scopedApprovals.filter((item) => {
      if (filter === "pending" && item.status !== "Pending") return false;
      if (filter === "approved" && item.status !== "Approved") return false;
      if (filter === "rejected" && item.status !== "Rejected") return false;
      if (!activeBranchIds.includes(item.branchId)) return false;
      return true;
    });
  }, [scopedApprovals, branchesInRegion, selectedRegion, selectedBranchId, filter]);

  return (
    <ScreenWrapper>
      <SectionHeader title="Approval Queue" />

      {/* STEP 1: REGIONS PICKER */}
      <View style={{ marginTop: spacing.xl }}>
        <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginBottom: spacing.sm, fontWeight: "600" }}>
          1. CHOOSE REGION
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <TouchableChip label="All Regions" isSelected={selectedRegion === "all"} onPress={() => setSelectedRegion("all")} />
          {uniqueRegions.map((region) => (
            <TouchableChip key={region} label={region} isSelected={selectedRegion === region} onPress={() => setSelectedRegion(region)} />
          ))}
        </View>
      </View>

      {/* STEP 2: BRANCH PICKER */}
      {selectedRegion !== "" ? (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginBottom: spacing.sm, fontWeight: "600" }}>
            2. CHOOSE BRANCH
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <TouchableChip label="All Branches" isSelected={selectedBranchId === "all"} onPress={() => setSelectedBranchId("all")} />
            {branchesInRegion.map((b) => (
              <TouchableChip key={b.id} label={b.name} isSelected={selectedBranchId === b.id} onPress={() => setSelectedBranchId(b.id)} />
            ))}
          </View>
        </View>
      ) : (
        <Card style={{ marginTop: spacing.xl, padding: spacing.xl, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
          <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>Select a region above to load branches</Text>
        </Card>
      )}

      {/* STEP 3: DATA SECTION */}
      {selectedRegion !== "" && selectedBranchId !== "" ? (
        <>
          <View style={{ marginTop: spacing.xl }}>
            <SegmentedControl
              tabs={[
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
              activeKey={filter}
              onChange={(v) => setTab("approvals", v)}
            />
          </View>

          <View style={{ gap: spacing.xl, marginTop: spacing.xl }}>
            {list.map((approval) => (
              <Card variant="glass" key={approval.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" }}>
                      <Badge label={approval.kind} type={approval.priority} />
                      <Badge label={approval.priority} type={approval.priority} />
                      <Badge label={approval.stage} type={approval.status} />
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md }}>
                      <View style={{ width: 24, height: 24, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                        <DollarSign size={12} color={colors.brand} strokeWidth={2} />
                      </View>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>{approval.title}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.md }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                        <DollarSign size={12} color={colors.brand} />
                        <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.brand }}>{formatMoney(approval.amount)}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{approval.age}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.md }}>{approval.note}</Text>
                  </View>
                </View>

                {filter === "pending" && (
                  <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl }}>
                    <TouchableOpacity onPress={() => approveRequest(approval.id)} style={{ backgroundColor: colors.success, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 }}>
                      <CheckCircle size={16} color={colors.white} strokeWidth={2} />
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => rejectRequest(approval.id)} style={{ backgroundColor: colors.error, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 }}>
                      <XCircle size={16} color={colors.white} strokeWidth={2} />
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </>
      ) : selectedRegion !== "" ? (
        <Card style={{ marginTop: spacing.xl, padding: spacing.xl, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
          <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>Select a branch to load approvals</Text>
        </Card>
      ) : null}
    </ScreenWrapper>
  );
}
