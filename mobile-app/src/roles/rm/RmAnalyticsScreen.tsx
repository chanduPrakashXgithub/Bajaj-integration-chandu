import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TrendingUp, Users, Clock, Heart, BarChart3, Lightbulb, Building, ShieldCheck, DollarSign, Layers } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

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

export function RmAnalyticsScreen() {
  const { scopedBranches, openBranchDetail } = useApp();
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

  const filtered = selectedBranchId !== ""
    ? (selectedBranchId === "all" ? branchesInRegion : branchesInRegion.filter((b) => b.id === selectedBranchId))
    : [];

  const avgRevenue = filtered.length > 0 ? Math.round(filtered.reduce((s, b) => s + b.revenueIndex, 0) / filtered.length) : 0;
  const avgFootfall = filtered.length > 0 ? Math.round(filtered.reduce((s, b) => s + b.customerFootfall, 0) / filtered.length) : 0;
  const avgSla = filtered.length > 0 ? Math.round(filtered.reduce((s, b) => s + b.sla, 0) / filtered.length) : 0;
  const avgHealth = filtered.length > 0 ? Math.round(filtered.reduce((s, b) => s + b.health, 0) / filtered.length) : 0;

  const lowestStaff = filtered.length > 0 ? filtered.reduce((a, b) => a.staffCount < b.staffCount ? a : b) : null;
  const lowestSla = filtered.length > 0 ? filtered.reduce((a, b) => a.sla < b.sla ? a : b) : null;
  const lowestHealth = filtered.length > 0 ? filtered.reduce((a, b) => a.health < b.health ? a : b) : null;

  return (
    <ScreenWrapper>
      <SectionHeader title="Regional Analytics" />

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

      {/* DATA DISPLAY */}
      {selectedRegion !== "" && selectedBranchId !== "" ? (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.xl }}>
            <View style={{ flex: 1, minWidth: 140 }}><StatCard label="Revenue index" value={String(avgRevenue)} meta="Regional average" accent={colors.brand} icon={TrendingUp} /></View>
            <View style={{ flex: 1, minWidth: 140 }}><StatCard label="Footfall" value={String(avgFootfall)} meta="Avg daily" accent={colors.brandSecondary} icon={Users} /></View>
            <View style={{ flex: 1, minWidth: 140 }}><StatCard label="SLA" value={`${avgSla}%`} meta="On-time" accent={colors.success} icon={Clock} /></View>
            <View style={{ flex: 1, minWidth: 140 }}><StatCard label="Health" value={`${avgHealth}%`} meta="Regional avg" accent={colors.warning} icon={Heart} /></View>
          </View>

          <Card variant="glass" style={{ marginTop: spacing.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 size={16} color={colors.brand} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Branch Comparison</Text>
            </View>
            <View style={{ gap: spacing.md }}>
              {filtered.map((branch) => (
                <TouchableOpacity key={branch.id} onPress={() => openBranchDetail(branch.id)} style={{ backgroundColor: colors.bg, borderRadius: borderRadius.xl, padding: spacing.xl }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <View style={{ width: 24, height: 24, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                        <Building size={12} color={colors.brand} strokeWidth={2} />
                      </View>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>{branch.name}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.lg }}>
                    <View style={{ flex: 1, minWidth: 70, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <TrendingUp size={12} color={colors.brand} />
                      <View>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Revenue</Text>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{branch.revenueIndex}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, minWidth: 70, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <Users size={12} color={colors.brandSecondary} />
                      <View>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Footfall</Text>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{branch.customerFootfall}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, minWidth: 70, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <Clock size={12} color={colors.success} />
                      <View>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>SLA</Text>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{branch.sla}%</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, minWidth: 70, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <Heart size={12} color={colors.warning} />
                      <View>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Health</Text>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{branch.health}%</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginTop: spacing.lg }}>
                    <ProgressBar value={branch.performance} color={branch.performance >= 80 ? colors.success : branch.performance >= 60 ? colors.warning : colors.error} height={8} />
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md }}>
                    <Badge label={`Audit: ${branch.auditScore}`} type={branch.auditScore >= 80 ? "Completed" : "Warning"} />
                    <Badge label={`Issues: ${branch.openIssues}`} type={branch.openIssues > 5 ? "Error" : "Success"} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card variant="glass" style={{ marginTop: spacing.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                <Lightbulb size={16} color={colors.brand} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Key Insights</Text>
            </View>
            <View style={{ gap: spacing.md }}>
              {[
                { icon: TrendingUp, color: colors.success, title: "Top performer", desc: `${filtered[0]?.name} leads with ${filtered[0]?.performance}% performance`, bg: colors.emerald50 },
                { icon: Users, color: colors.brandSecondary, title: "Staffing need", desc: lowestStaff ? `${lowestStaff.name} has lowest staff` : "", bg: colors.sky50 },
                { icon: Clock, color: colors.warning, title: "SLA risk", desc: lowestSla ? `${lowestSla.name} needs SLA improvement` : "", bg: colors.amber50 },
                { icon: Heart, color: colors.error, title: "Health concern", desc: lowestHealth ? `${lowestHealth.name} lowest health` : "", bg: colors.rose50 },
              ].map((insight, i) => (
                <View key={i} style={{ flexDirection: "row", gap: spacing.lg, backgroundColor: insight.bg, borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: "flex-start" }}>
                  <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: insight.color + "20", alignItems: "center", justifyContent: "center" }}>
                    <insight.icon size={18} color={insight.color} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>{insight.title}</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>{insight.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : (
        selectedRegion !== "" && (
          <Card style={{ marginTop: spacing.xl, padding: spacing.xl, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
            <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>Select a branch or "All Branches" to load analytics</Text>
          </Card>
        )
      )}
    </ScreenWrapper>
  );
}
