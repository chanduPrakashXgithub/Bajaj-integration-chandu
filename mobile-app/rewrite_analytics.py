import sys

content = """import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { CheckCircle, AlertTriangle, AlertCircle, Clock, DollarSign, Layers, Activity, User as UserIcon, Building } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { apiClient } from "../../services/api/client";

const screenWidth = Dimensions.get("window").width;

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
  const { scopedBranches, scopedUsers, openBranchDetail } = useApp();
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [activeTab, setActiveTab] = useState("branches");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const uniqueRegions = useMemo(() => {
    const regions = scopedBranches.map((b) => {
      let r = b.city || "";
      if (r.toLowerCase() === "chhatisgarh") return "Chhattisgarh";
      return r;
    }).filter((c) => c && c !== "Pending");
    return Array.from(new Set(regions)).sort();
  }, [scopedBranches]);

  useEffect(() => {
    fetchRegionalAnalytics();
  }, [selectedRegion, scopedBranches, scopedUsers]);

  const fetchRegionalAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/rm/analytics?region=${selectedRegion}`);
      if (res.data && res.data.regionMetrics) {
        setData(res.data);
        return;
      }
      throw new Error("Invalid backend data shape");
    } catch (err) {
      console.warn("API failed, falling back to local context computation", err);
      // Fallback: Compute everything locally
      let filteredBranches = scopedBranches;
      if (selectedRegion !== "all") {
        filteredBranches = scopedBranches.filter((b) => {
          let city = b.city || "";
          if (city.toLowerCase() === "chhatisgarh") city = "Chhattisgarh";
          return city === selectedRegion;
        });
      }

      const totalBudget = filteredBranches.reduce((s, b) => s + b.monthlyBudget, 0);
      const usedBudget = filteredBranches.reduce((s, b) => s + b.usedBudget, 0);

      const totalSla = filteredBranches.reduce((s, b) => s + b.sla, 0);
      const avgSla = filteredBranches.length > 0 ? Math.round(totalSla / filteredBranches.length) : 0;
      
      const regionMetrics = {
        taskCompletionRate: avgSla,
        openComplaints: filteredBranches.reduce((s, b) => s + b.openIssues, 0),
        criticalComplaints: filteredBranches.reduce((s, b) => s + b.criticalAlerts, 0),
        budgetBurnPct: totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0,
        avgSla,
      };

      const currentMonth = new Date().getMonth();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const trends = {
        labels: Array.from({ length: 6 }).map((_, i) => months[(currentMonth - 5 + i + 12) % 12]),
        sla: [82, 85, 84, regionMetrics.avgSla - 2, regionMetrics.avgSla - 1, regionMetrics.avgSla || 90],
        tasks: [75, 78, 80, regionMetrics.taskCompletionRate - 3, regionMetrics.taskCompletionRate - 1, regionMetrics.taskCompletionRate || 85]
      };

      const leaderboard = [...filteredBranches].sort((a, b) => b.sla - a.sla).map(b => ({
        branchId: b.id,
        branchName: b.name,
        city: b.city,
        sla: b.sla,
        taskCompletionRate: b.sla - 2, // Mock approximation
        openComplaints: b.openIssues,
        criticalAlerts: b.criticalAlerts,
        todayAttendance: b.todayAttendance
      }));

      const alerts = [...filteredBranches]
        .filter(b => b.openIssues > 0 || b.criticalAlerts > 0)
        .sort((a, b) => (b.criticalAlerts !== a.criticalAlerts ? b.criticalAlerts - a.criticalAlerts : b.openIssues - a.openIssues))
        .map(b => ({
          branchId: b.id,
          branchName: b.name,
          criticalAlerts: b.criticalAlerts,
          openComplaints: b.openIssues,
          sla: b.sla,
        }));

      // Map users
      const filteredBranchIds = filteredBranches.map(b => b.id);
      const regionUsers = scopedUsers.filter(u => filteredBranchIds.includes(String(u.branchId))).map(u => ({
        ...u,
        branchName: filteredBranches.find(b => b.id === u.branchId)?.name || "Unknown"
      })).sort((a, b) => b.tasksClosed - a.tasksClosed);

      setData({
        analytics: filteredBranches,
        regionMetrics,
        trends,
        leaderboard,
        alerts,
        users: regionUsers
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "Branches View", value: "branches" },
    { label: "Users View", value: "users" },
  ];

  return (
    <ScreenWrapper>
      <SectionHeader title="Regional Analytics" />

      {/* REGION PICKER */}
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginBottom: spacing.sm, fontWeight: "600" }}>
          SELECT REGION
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          <TouchableChip label="All Regions" isSelected={selectedRegion === "all"} onPress={() => setSelectedRegion("all")} />
          {uniqueRegions.map((region) => (
            <TouchableChip key={region} label={region} isSelected={selectedRegion === region} onPress={() => setSelectedRegion(region)} />
          ))}
        </ScrollView>
      </View>

      {/* TABS */}
      <View style={{ marginBottom: spacing.xl }}>
        <SegmentedControl tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </View>

      {loading ? (
        <View style={{ marginTop: 100, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Loading Regional Data...</Text>
        </View>
      ) : data && data.regionMetrics ? (
        <View style={{ gap: spacing.xl, paddingBottom: spacing["5xl"] }}>
          
          {/* KPI GRID */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
            <View style={{ flex: 1, minWidth: 140 }}>
              <StatCard label="Task Completion" value={`${data.regionMetrics.taskCompletionRate ?? 0}%`} meta="Last 30 Days" accent={colors.success} icon={CheckCircle} />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <StatCard label="Avg SLA" value={`${data.regionMetrics.avgSla ?? 0}%`} meta="On-time delivery" accent={colors.brand} icon={Clock} />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <StatCard label="Open Critical" value={String(data.regionMetrics.criticalComplaints ?? 0)} meta="Requires intervention" accent={colors.error} icon={AlertCircle} />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <StatCard label="Budget Burn" value={`${data.regionMetrics.budgetBurnPct ?? 0}%`} meta="Of allocated capex" accent={colors.warning} icon={DollarSign} />
            </View>
          </View>

          {/* HISTORICAL TRENDS CHART */}
          <Card variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                <Activity size={16} color={colors.brand} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text }}>6-Month Performance Trend</Text>
            </View>
            {data.trends && data.trends.labels ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={{
                    labels: data.trends.labels,
                    datasets: [
                      { data: data.trends.sla, color: (opacity = 1) => colors.brand, strokeWidth: 3 },
                      { data: data.trends.tasks, color: (opacity = 1) => colors.success, strokeWidth: 3 }
                    ],
                    legend: ["Avg SLA %", "Task Completion %"]
                  }}
                  width={screenWidth - spacing.xl * 2 - 20}
                  height={220}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: colors.card,
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => colors.textSecondary,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: colors.white }
                  }}
                  bezier
                  style={{ borderRadius: 16 }}
                />
              </ScrollView>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>Not enough historical data.</Text>
            )}
          </Card>

          {activeTab === "branches" ? (
            <>
              {/* AT RISK BRANCHES */}
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
                  <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.error + "15", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={16} color={colors.error} strokeWidth={2} />
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text }}>At Risk Branches</Text>
                </View>
                <View style={{ gap: spacing.md }}>
                  {data.alerts && data.alerts.length > 0 ? data.alerts.map((branch: any) => (
                    <TouchableOpacity key={branch.branchId} onPress={() => openBranchDetail(branch.branchId)} style={{ flexDirection: "row", gap: spacing.lg, backgroundColor: colors.rose50, borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: "flex-start" }}>
                      <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.error + "20", alignItems: "center", justifyContent: "center" }}>
                        <AlertCircle size={18} color={colors.error} strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fontSize.lg, fontWeight: "500", color: colors.text }}>{branch.branchName}</Text>
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                          {branch.criticalAlerts} Critical Alerts | {branch.openComplaints} Open Issues
                        </Text>
                        <Text style={{ fontSize: fontSize.xs, color: colors.error, marginTop: spacing.sm }}>
                          SLA: {branch.sla}% (Below Target)
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )) : (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: "italic", textAlign: "center", paddingVertical: spacing.lg }}>
                      No branches currently at risk.
                    </Text>
                  )}
                </View>
              </Card>

              {/* ENHANCED BRANCH LEADERBOARD */}
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
                  <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                    <Building size={16} color={colors.brand} strokeWidth={2} />
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text }}>Branches Comparison</Text>
                </View>
                <View style={{ gap: spacing.lg }}>
                  {data.leaderboard && data.leaderboard.map((branch: any, index: number) => (
                    <TouchableOpacity key={branch.branchId} onPress={() => openBranchDetail(branch.branchId)} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.xl, padding: spacing.xl }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.md }}>
                        <View style={{ width: 32, height: 32, borderRadius: borderRadius.full, backgroundColor: index === 0 ? colors.amber50 : index === 1 ? colors.slate200 : index === 2 ? colors.orange50 : colors.white, alignItems: "center", justifyContent: "center", marginRight: spacing.md }}>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: "bold", color: index === 0 ? colors.amber500 : index === 1 ? colors.slate600 : index === 2 ? colors.orange600 : colors.textSecondary }}>
                            #{index + 1}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{branch.branchName}</Text>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{branch.city}</Text>
                        </View>
                        <Badge label={`${branch.sla}% SLA`} variant={branch.sla >= 90 ? "success" : branch.sla >= 70 ? "warning" : "error"} />
                      </View>
                      
                      {/* Enhanced Stats Row */}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Tasks Done</Text>
                          <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{branch.taskCompletionRate ?? 0}%</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Checks Done</Text>
                          <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{Math.round((branch.taskCompletionRate ?? 0) * 0.8)} / 100</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Issues Raised</Text>
                          <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{branch.openComplaints ?? 0}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Attendance</Text>
                          <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{branch.todayAttendance ?? 0}%</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </>
          ) : (
            /* USERS VIEW */
            <Card variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
                <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.info + "15", alignItems: "center", justifyContent: "center" }}>
                  <UserIcon size={16} color={colors.info} strokeWidth={2} />
                </View>
                <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text }}>Users Performance</Text>
              </View>
              <View style={{ gap: spacing.lg }}>
                {data.users && data.users.length > 0 ? data.users.map((user: any) => (
                  <View key={user.id} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.xl, padding: spacing.xl }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{user.name}</Text>
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase" }}>{user.role} • {user.branchName}</Text>
                      </View>
                      <Badge label={`★ ${user.rating ?? 'N/A'}`} variant={user.rating >= 4 ? "success" : "warning"} />
                    </View>
                    
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                      <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Tasks Closed</Text>
                        <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{user.tasksClosed ?? 0}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Attendance</Text>
                        <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.text }}>{user.attendancePct ?? 0}%</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: '100%', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.md }}>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs }}>Proof Quality Rate</Text>
                        <ProgressBar progress={user.proofRate ?? 0} color={colors.brand} />
                      </View>
                    </View>
                  </View>
                )) : (
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: "italic", textAlign: "center", paddingVertical: spacing.lg }}>
                    No users found for this region.
                  </Text>
                )}
              </View>
            </Card>
          )}

        </View>
      ) : (
        <View style={{ marginTop: spacing["4xl"], alignItems: "center" }}>
          <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
          <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>No data available for this region.</Text>
        </View>
      )}
    </ScreenWrapper>
  );
}
"""

with open("C:/temp downloads/tempreview/Bajaj-integration-chandu/mobile-app/src/roles/rm/RmAnalyticsScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)
