import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Wallet, TrendingDown, Building, Clock, ChevronRight, Layers } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius, shadows } from "../../theme/theme";
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

export function RmFinanceScreen() {
  const { scopedBranches, scopedApprovals, openBranchDetail, updateBranchBudget, openApprovalDetail } = useApp();
  
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("");
  const [budgetInput, setBudgetInput] = useState("");
  const [approvalSort, setApprovalSort] = useState<"priority" | "amount">("priority");
  
  // Set budget input when selected branch changes
  useEffect(() => {
    if (selectedBranchId) {
      const b = scopedBranches.find((x) => x.id === selectedBranchId);
      if (b) {
        setBudgetInput(String(b.monthlyBudget));
      }
    } else {
      setBudgetInput("");
    }
  }, [selectedBranchId, scopedBranches]);

  // Reset branch selection when region changes
  useEffect(() => {
    setSelectedBranchId("");
  }, [selectedRegion]);

  // Extract unique regions (normalizing Chhattisgarh typos)
  const uniqueRegions = useMemo(() => {
    const regions = scopedBranches.map((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") return "Chhattisgarh";
      return r;
    }).filter((c) => c && c !== "Pending");
    return Array.from(new Set(regions)).sort();
  }, [scopedBranches]);

  // Dynamically filter branches based on selected region
  const branchesInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return scopedBranches.filter((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") r = "Chhattisgarh";
      return r === selectedRegion;
    });
  }, [scopedBranches, selectedRegion]);

  // Aggregate stats (based on branches in selected region)
  const totalBudget = branchesInRegion.reduce((s, b) => s + b.monthlyBudget, 0);
  const totalUsed = branchesInRegion.reduce((s, b) => s + b.usedBudget, 0);
  const totalBurnPct = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;
  
  const pendingApprovals = scopedApprovals.filter(
    (a) => a.status === "Pending" && (!selectedBranchId || a.branchId === selectedBranchId)
  );

  const selectedBranchData = selectedBranchId ? scopedBranches.find((b) => b.id === selectedBranchId) : null;

  // Branch roster sorted by name
  const sortedBranches = [...branchesInRegion].sort((a, b) => a.name.localeCompare(b.name));

  // Sorted approvals list
  const sortedApprovals = [...pendingApprovals].sort((a, b) => {
    if (approvalSort === "amount") {
      return b.amount - a.amount;
    }
    const prioMap: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (prioMap[b.priority] || 0) - (prioMap[a.priority] || 0);
  });

  const handleUpdateBudget = async () => {
    if (!selectedBranchId) return;
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    await updateBranchBudget(selectedBranchId, amount);
  };

  return (
    <ScreenWrapper>
      <SectionHeader 
        title="Financial Ops & Budget Command" 
        subtitle="Capex allocations, monthly branch ceiling configurations and emergency expense review"
      />

      {/* STEP 1: REGIONS PICKER */}
      <View style={{ marginTop: spacing.xl }}>
        <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginBottom: spacing.sm, fontWeight: "600" }}>
          1. CHOOSE REGION
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {uniqueRegions.map((region) => (
            <TouchableChip key={region} label={region} isSelected={selectedRegion === region} onPress={() => setSelectedRegion(region)} />
          ))}
        </View>
      </View>

      {/* STEP 2: BRANCH PICKER (revealed only after region selected) */}
      {selectedRegion !== "" ? (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginBottom: spacing.sm, fontWeight: "600" }}>
            2. CHOOSE BRANCH
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
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

      {/* DATA DISPLAY - visible only when both region and branch are selected */}
      {selectedRegion !== "" && selectedBranchId !== "" ? (
        <>
          {/* Overview stats */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.xl }}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <StatCard 
                label="Total Regional Budget" 
                value={formatMoney(totalBudget)} 
                meta="Combined monthly limits" 
                icon={Wallet} 
                accent={colors.brand} 
              />
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <StatCard 
                label="Total Regional Spend" 
                value={formatMoney(totalUsed)} 
                meta={`${totalBurnPct}% total burn rate`} 
                icon={TrendingDown} 
                accent={colors.warning} 
              />
            </View>
          </View>

          <View style={{ marginTop: spacing.xl, flexDirection: "row", flexWrap: "wrap", gap: spacing.xl }}>
            
            {/* Left Column: Budget allocations & controls */}
            <View style={{ flex: 2, minWidth: 320, gap: spacing.xl }}>
              
              {/* Allocation control card (visible when branch is selected) */}
              {selectedBranchData && (
                <Card variant="soft" style={{ borderLeftWidth: 4, borderLeftColor: colors.brand, ...shadows.card }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                    <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900 }}>
                      Adjust Budget Ceiling
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedBranchId("")} style={{ padding: spacing.xs }}>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate400 }}>Clear Selection</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: "700", color: colors.slate900 }}>
                    {selectedBranchData.name}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.slate500, marginTop: 2 }}>
                    Current Limit: {formatMoney(selectedBranchData.monthlyBudget)} · Spent: {formatMoney(selectedBranchData.usedBudget)}
                  </Text>
                  
                  <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xl, alignItems: "center" }}>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.slate400, marginRight: spacing.xs }}>₹</Text>
                      <TextInput 
                        value={budgetInput}
                        onChangeText={setBudgetInput}
                        placeholder="Enter limit"
                        keyboardType="numeric"
                        style={{ flex: 1, paddingVertical: spacing.md, color: colors.slate900, fontSize: fontSize.sm, fontWeight: "600" }}
                      />
                    </View>
                    <TouchableOpacity 
                      onPress={handleUpdateBudget}
                      style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, justifyContent: "center", height: 48 }}
                    >
                      <Text style={{ color: colors.white, fontSize: fontSize.sm, fontWeight: "700" }}>Apply Limit</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}

              {/* Roster of branch budgets (shows branches in selected region) */}
              <Card variant="glass">
                <Text style={{ fontSize: fontSize.lg, fontWeight: "700", color: colors.slate900, marginBottom: spacing.lg }}>Branch Budget Roster</Text>
                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: spacing.lg }}>
                    {sortedBranches.map((branch) => {
                      const pct = branch.monthlyBudget > 0 ? Math.round((branch.usedBudget / branch.monthlyBudget) * 100) : 0;
                      const isSelected = selectedBranchId === branch.id;
                      return (
                        <TouchableOpacity 
                          key={branch.id} 
                          onPress={() => setSelectedBranchId(branch.id)}
                          activeOpacity={0.7} 
                          style={{ 
                            backgroundColor: isSelected ? colors.brandLight : colors.white, 
                            borderRadius: borderRadius.xl, 
                            padding: spacing.lg, 
                            borderWidth: 1, 
                            borderColor: isSelected ? colors.brand : colors.border 
                          }}
                        >
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                              <Building size={16} color={colors.slate600} />
                              <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900 }}>{branch.name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                              <Badge label={`${pct}% Used`} type={pct >= 85 ? "Critical" : pct >= 65 ? "High" : "Completed"} />
                              <TouchableOpacity onPress={() => openBranchDetail(branch.id)}>
                                <ChevronRight size={16} color={colors.slate400} />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          <View style={{ marginTop: spacing.md }}>
                            <ProgressBar value={pct} color={pct >= 85 ? colors.error : pct >= 65 ? colors.warning : colors.success} height={6} />
                          </View>
                          
                          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md }}>
                            <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Spent: {formatMoney(branch.usedBudget)}</Text>
                            <Text style={{ fontSize: fontSize.xs, color: colors.slate500 }}>Ceiling: {formatMoney(branch.monthlyBudget)}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </Card>
            </View>

            {/* Right Column: Approvals list */}
            <View style={{ flex: 1.5, minWidth: 280, gap: spacing.xl }}>
              <Card variant="glass">
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
                  <View>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: "700", color: colors.slate900 }}>Financial Approvals</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.slate500, marginTop: 2 }}>{pendingApprovals.length} pending</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: spacing.xs, alignItems: "center" }}>
                    <TouchableOpacity onPress={() => setApprovalSort(approvalSort === "priority" ? "amount" : "priority")}>
                      <Text style={{ fontSize: fontSize.xs, color: colors.brand, fontWeight: "600" }}>
                        Sort: {approvalSort === "priority" ? "Priority" : "Amount"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ gap: spacing.md }}>
                  {sortedApprovals.map((approval) => (
                    <TouchableOpacity 
                      key={approval.id} 
                      onPress={() => openApprovalDetail(approval.id)}
                      activeOpacity={0.8}
                      style={{ backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
                    >
                      <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
                        <Badge label={approval.kind} type={approval.priority} />
                        <Badge label={approval.priority} type={approval.priority} />
                      </View>
                      <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.slate900, marginTop: spacing.md }}>
                        {approval.title}
                      </Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500, marginTop: spacing.xs }}>
                        {approval.note}
                      </Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md }}>
                        <Text style={{ fontSize: fontSize.lg, fontWeight: "700", color: colors.brand }}>
                          {formatMoney(approval.amount)}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                          <Clock size={12} color={colors.slate400} />
                          <Text style={{ fontSize: fontSize.xs, color: colors.slate400 }}>{approval.age}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {sortedApprovals.length === 0 && (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>
                      No pending approvals
                    </Text>
                  )}
                </View>
              </Card>
            </View>

          </View>
        </>
      ) : selectedRegion !== "" ? (
        <Card style={{ marginTop: spacing.xl, padding: spacing.xl, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
          <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>Select a branch to load finances</Text>
        </Card>
      ) : null}
    </ScreenWrapper>
  );
}
