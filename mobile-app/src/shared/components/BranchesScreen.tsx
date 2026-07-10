import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  Building, TrendingUp, Users, Clock, AlertCircle, TriangleAlert,
  ShieldCheck, DollarSign, ChevronRight, BarChart3, Activity,
  MapPin, Wrench, Layers
} from "lucide-react-native";
import { ScreenWrapper } from "../layout/ScreenWrapper";
import { SectionHeader } from "./SectionHeader";
import { SegmentedControl } from "./SegmentedControl";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import { Card } from "./Card";
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

export function BranchesScreen() {
  const { state, setTab, scopedBranches, openBranchDetail, openFormModal, users } = useApp();
  const isRm = state.role === "rm";
  const activeTab = isRm ? (state.tabs.rmIntelligence || "performance") : null;
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

  const filtered = isRm
    ? branchesInRegion.filter((b) => selectedBranchId === "all" ? true : b.id === selectedBranchId)
    : scopedBranches;



  return (
    <ScreenWrapper>
      <SectionHeader
        title={isRm ? "Branch Intelligence" : "Branch Directory"}
        subtitle={
          isRm
            ? "Performance score, risk mix, finance burn and drill-down detail across all branches"
            : "Every branch opens into a deep operational drawer with staffing, finance, appliance and issue detail"
        }
        action={
          isRm ? (
            <SegmentedControl
              tabs={[{ label: "Performance", value: "performance" }, { label: "Risk", value: "risk" }]}
              activeKey={activeTab!}
              onChange={(v) => setTab("rmIntelligence", v)}
            />
          ) : undefined
        }
      />

      {isRm ? (
        <>
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

          {selectedRegion !== "" && selectedBranchId !== "" ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, marginTop: spacing.xl, paddingBottom: 60 }}>
              {filtered.length === 0 ? (
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>No branches found</Text>
              ) : filtered.map((branch) => {
                const budgetPct = Math.round((branch.usedBudget / branch.monthlyBudget) * 100);
                const branchLc = (users || []).find(u => u.role === "lc" && String(u.branchId) === String(branch.id));
                const branchAa = (users || []).find(u => u.role === "aa" && u.branchScope?.map(String).includes(String(branch.id)));
                const branchAm = (users || []).find(u => u.role === "branchManager" && u.branchScope?.map(String).includes(String(branch.id)));

                return (
                  <View key={branch.id} style={{ backgroundColor: colors.white, borderRadius: 24, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.card }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
                      <View style={{ flex: 1, flexDirection: "row", gap: spacing.lg }}>
                        <View style={{ width: 48, height: 48, borderRadius: borderRadius["2xl"], backgroundColor: colors.slate50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                          <Building size={24} color={colors.slate700} strokeWidth={1.5} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.slate900 }}>{branch.name}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs }}>
                            <MapPin size={14} color={colors.slate400} />
                            <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{branch.city} · {branch.address}</Text>
                          </View>
                        </View>
                      </View>
                      <Badge label={branch.code} type="Pending" />
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.slate50, borderRadius: borderRadius.xl, padding: spacing.lg }}>
                      {isRm ? (
                        <View style={{ flex: 1, minWidth: 80 }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Performance</Text>
                          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.slate900 }}>{branch.performance}%</Text>
                        </View>
                      ) : (
                        <View style={{ flex: 1, minWidth: 80 }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Staff</Text>
                          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.slate900 }}>{branch.staffCount}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, minWidth: 80 }}>
                        <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Attendance</Text>
                        <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.slate900 }}>{branch.todayAttendance}%</Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 80 }}>
                        <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Issues</Text>
                        <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: branch.openIssues > 0 ? colors.amber700 : colors.emerald600 }}>{branch.openIssues}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
                      <View style={{ flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.red50, alignItems: "center", justifyContent: "center" }}>
                          <TriangleAlert size={14} color={colors.error} />
                        </View>
                        <View>
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Critical Alerts</Text>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate900 }}>{branch.criticalAlerts}</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.amber50, alignItems: "center", justifyContent: "center" }}>
                          <Wrench size={14} color={colors.amber700} />
                        </View>
                        <View>
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Appliance Risk</Text>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate900 }}>{branch.applianceRisk}</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sky50, alignItems: "center", justifyContent: "center" }}>
                          <DollarSign size={14} color={colors.sky600} />
                        </View>
                        <View>
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Budget Used</Text>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate900 }}>{budgetPct}%</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ borderTopWidth: 1, borderColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm }}>
                      <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>Branch Staffing</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xs }}>
                        <View style={{ flex: 1, minWidth: 100 }}>
                          <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "500" }}>AM (Branch Manager)</Text>
                          <Text style={{ fontSize: fontSize.sm, color: colors.slate800, marginTop: 2 }}>{branchAm ? branchAm.name : "Unassigned"}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 100 }}>
                          <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "500" }}>AA (Admin Assistant)</Text>
                          <Text style={{ fontSize: fontSize.sm, color: colors.slate800, marginTop: 2 }}>{branchAa ? branchAa.name : "Unassigned"}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 100 }}>
                          <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "500" }}>LC (Local Coordinator)</Text>
                          <Text style={{ fontSize: fontSize.sm, color: colors.slate800, marginTop: 2 }}>{branchLc ? branchLc.name : "Unassigned"}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ borderTopWidth: 1, borderColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.xl, flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
                      <TouchableOpacity onPress={() => openBranchDetail(branch.id)} style={{ flex: 1, minWidth: 120, backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate700 }}>Branch Deep Dive</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : selectedRegion !== "" ? (
            <Card style={{ marginTop: spacing.xl, padding: spacing.xl, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
              <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
              <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>Select a branch to load data</Text>
            </Card>
          ) : null}
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, marginTop: spacing.xl, paddingBottom: 60 }}>
          {filtered.length === 0 ? (
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>No branches found</Text>
          ) : filtered.map((branch) => {
            const budgetPct = Math.round((branch.usedBudget / branch.monthlyBudget) * 100);
            const branchLc = (users || []).find(u => u.role === "lc" && String(u.branchId) === String(branch.id));
            const branchAa = (users || []).find(u => u.role === "aa" && u.branchScope?.map(String).includes(String(branch.id)));
            const branchAm = (users || []).find(u => u.role === "branchManager" && u.branchScope?.map(String).includes(String(branch.id)));

            return (
              <View key={branch.id} style={{ backgroundColor: colors.white, borderRadius: 24, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.card }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
                  <View style={{ flex: 1, flexDirection: "row", gap: spacing.lg }}>
                    <View style={{ width: 48, height: 48, borderRadius: borderRadius["2xl"], backgroundColor: colors.slate50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                      <Building size={24} color={colors.slate700} strokeWidth={1.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.slate900 }}>{branch.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs }}>
                        <MapPin size={14} color={colors.slate400} />
                        <Text style={{ fontSize: fontSize.sm, color: colors.slate500 }}>{branch.city} · {branch.address}</Text>
                      </View>
                    </View>
                  </View>
                  <Badge label={branch.code} type="Pending" />
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.slate50, borderRadius: borderRadius.xl, padding: spacing.lg }}>
                  {isRm ? (
                    <View style={{ flex: 1, minWidth: 80 }}>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Performance</Text>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.slate900 }}>{branch.performance}%</Text>
                    </View>
                  ) : (
                    <View style={{ flex: 1, minWidth: 80 }}>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Staff</Text>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.slate900 }}>{branch.staffCount}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, minWidth: 80 }}>
                    <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Attendance</Text>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.slate900 }}>{branch.todayAttendance}%</Text>
                  </View>

                  <View style={{ flex: 1, minWidth: 80 }}>
                    <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Issues</Text>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: branch.openIssues > 0 ? colors.amber700 : colors.emerald600 }}>{branch.openIssues}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
                  <View style={{ flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.red50, alignItems: "center", justifyContent: "center" }}>
                      <TriangleAlert size={14} color={colors.error} />
                    </View>
                    <View>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Critical Alerts</Text>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate900 }}>{branch.criticalAlerts}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.amber50, alignItems: "center", justifyContent: "center" }}>
                      <Wrench size={14} color={colors.amber700} />
                    </View>
                    <View>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Appliance Risk</Text>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate900 }}>{branch.applianceRisk}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, minWidth: 100, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sky50, alignItems: "center", justifyContent: "center" }}>
                      <DollarSign size={14} color={colors.sky600} />
                    </View>
                    <View>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Budget Used</Text>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate900 }}>{budgetPct}%</Text>
                    </View>
                  </View>
                </View>

                <View style={{ borderTopWidth: 1, borderColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm }}>
                  <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>Branch Staffing</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xs }}>
                    <View style={{ flex: 1, minWidth: 100 }}>
                      <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "500" }}>AM (Branch Manager)</Text>
                      <Text style={{ fontSize: fontSize.sm, color: colors.slate800, marginTop: 2 }}>{branchAm ? branchAm.name : "Unassigned"}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 100 }}>
                      <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "500" }}>AA (Admin Assistant)</Text>
                      <Text style={{ fontSize: fontSize.sm, color: colors.slate800, marginTop: 2 }}>{branchAa ? branchAa.name : "Unassigned"}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 100 }}>
                      <Text style={{ fontSize: 10, color: colors.slate400, fontWeight: "500" }}>LC (Local Coordinator)</Text>
                      <Text style={{ fontSize: fontSize.sm, color: colors.slate800, marginTop: 2 }}>{branchLc ? branchLc.name : "Unassigned"}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ borderTopWidth: 1, borderColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.xl, flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
                  <TouchableOpacity onPress={() => openBranchDetail(branch.id)} style={{ flex: 1, minWidth: 120, backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.slate700 }}>Branch Deep Dive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
