import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Building, MapPin, ChevronRight, TriangleAlert, Wrench, DollarSign } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { Badge } from "../../shared/components/Badge";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius, shadows } from "../../theme/theme";

import { Branch } from "../../types/domain";

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

export function BranchManagerBranchesScreen() {
  const { scopedBranches, openBranchDetail, openFormModal, state } = useApp();
  const [selectedRegion, setSelectedRegion] = useState("all");


  // Normalize region names and extract unique regions
  const uniqueRegions = useMemo(() => {
    const regions = scopedBranches.map((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") return "Chhattisgarh";
      return r;
    }).filter((c) => c && c !== "Pending");
    return Array.from(new Set(regions)).sort();
  }, [scopedBranches]);

  // Filter branches dynamically based on selected region
  const filteredBranches = useMemo(() => {
    if (selectedRegion === "all") return scopedBranches;
    return scopedBranches.filter((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") r = "Chhattisgarh";
      return r === selectedRegion;
    });
  }, [scopedBranches, selectedRegion]);


  return (
    <ScreenWrapper>
      <SectionHeader 
        title="Branch Directory" 
        subtitle="Operational, financial and staffing summary across your branches"
      />

      {/* REGIONS CHIPS FILTER */}
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginBottom: spacing.sm, fontWeight: "600" }}>
          REGIONS
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <TouchableChip label="All Regions" isSelected={selectedRegion === "all"} onPress={() => setSelectedRegion("all")} />
          {uniqueRegions.map((region) => (
            <TouchableChip key={region} label={region} isSelected={selectedRegion === region} onPress={() => setSelectedRegion(region)} />
          ))}
        </View>
      </View>

      {/* COMPACT BRANCH CARDS LIST */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, marginTop: spacing.md, paddingBottom: 60 }}>
        {filteredBranches.length === 0 ? (
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>
            No branches found in this region
          </Text>
        ) : (
          filteredBranches.map((branch) => {
            const budgetPct = Math.round((branch.usedBudget / branch.monthlyBudget) * 100);

            return (
              <View 
                key={branch.id} 
                style={{ 
                  backgroundColor: colors.white, 
                  borderRadius: 16, 
                  padding: spacing.lg, 
                  borderWidth: 1, 
                  borderColor: colors.border, 
                  ...shadows.card 
                }}
              >
                {/* Header Row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.slate50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                      <Building size={18} color={colors.slate700} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.slate900 }} numberOfLines={1}>
                        {branch.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.slate500 }} numberOfLines={1}>
                        {branch.city} • {branch.address}
                      </Text>
                    </View>
                  </View>
                  <Badge label={branch.code} type="Pending" />
                </View>

                {/* Metrics Row (Compact Grid) */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.slate50, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: colors.slate500, textTransform: "uppercase" }}>Staff</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.slate800, marginTop: 2 }}>{branch.staffCount}</Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: colors.slate500, textTransform: "uppercase" }}>Attendance</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.slate800, marginTop: 2 }}>{branch.todayAttendance}%</Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: colors.slate500, textTransform: "uppercase" }}>SLA</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.slate800, marginTop: 2 }}>{branch.sla}%</Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: colors.slate500, textTransform: "uppercase" }}>Issues</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: branch.openIssues > 0 ? colors.amber700 : colors.emerald600, marginTop: 2 }}>{branch.openIssues}</Text>
                  </View>
                </View>

                {/* Sub-Metrics Row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md, paddingHorizontal: spacing.xs }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TriangleAlert size={12} color={colors.error} />
                    <Text style={{ fontSize: 11, color: colors.slate600 }}>Alerts: {branch.criticalAlerts}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Wrench size={12} color={colors.warning} />
                    <Text style={{ fontSize: 11, color: colors.slate600 }}>Risk: {branch.applianceRisk}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1, justifyContent: "flex-end", maxWidth: 120 }}>
                    <DollarSign size={12} color={colors.slate400} />
                    <Text style={{ fontSize: 11, color: colors.slate600, marginRight: 4 }}>Budget: {budgetPct}%</Text>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.slate100, overflow: "hidden" }}>
                      <View style={{ width: `${Math.min(budgetPct, 100)}%`, height: "100%", backgroundColor: budgetPct > 85 ? colors.error : colors.success }} />
                    </View>
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={{ borderTopWidth: 1, borderColor: colors.slate100, paddingTop: spacing.md, flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
                  <TouchableOpacity onPress={() => openBranchDetail(branch.id)} style={{ flex: 1, minWidth: 100, backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Branch Deep Dive</Text>
                    <ChevronRight size={14} color={colors.white} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
