import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { TriangleAlert, AlertCircle, Info, Bell, CheckCircle, Shield, Layers } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
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

export function RmAlertsScreen() {
  const { state, setTab, setPage, scopedNotifications, scopedBranches, scopedComplaints, alertStates, acknowledgeAlert, escalateAlert, openBranchDetail, openComplaintDetail } = useApp();
  const filter = state.tabs.rmAlerts || "all";

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

  const filtered = scopedNotifications.filter((item) => {
    if (selectedBranchId === "all") {
      const regionBranchIds = branchesInRegion.map(b => b.id);
      if (!regionBranchIds.includes(item.branchId)) return false;
    } else if (selectedBranchId !== "") {
      if (item.branchId !== selectedBranchId) return false;
    }

    const titleStr = item.title.toLowerCase();
    const detailStr = item.detail.toLowerCase();

    if (filter === "complaints") {
      return titleStr.includes("cmp") || titleStr.includes("complaint") || titleStr.includes("issue") || detailStr.includes("cmp") || detailStr.includes("complaint");
    } else if (filter === "approvals") {
      return titleStr.includes("approval") || titleStr.includes("budget") || titleStr.includes("approve") || detailStr.includes("approval") || detailStr.includes("budget");
    } else if (filter === "attendance") {
      return titleStr.includes("attendance") || titleStr.includes("punched") || titleStr.includes("absent") || detailStr.includes("attendance");
    } else if (filter === "tasks") {
      return titleStr.includes("task") || titleStr.includes("check") || titleStr.includes("sla") || detailStr.includes("task") || detailStr.includes("sla");
    }

    return true; // "all"
  });

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Alert Center"
        action={
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SegmentedControl 
              tabs={[
                { label: "All", value: "all" }, 
                { label: "Issues", value: "complaints" }, 
                { label: "Approvals", value: "approvals" }, 
                { label: "Attendance", value: "attendance" }, 
                { label: "Tasks", value: "tasks" }
              ]} 
              activeKey={filter} 
              onChange={(v) => setTab("rmAlerts", v)} 
            />
          </ScrollView>
        }
      />

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
        <View style={{ gap: spacing.xl, marginTop: spacing.xl }}>
          {filtered.map((item) => {
            const alertState = alertStates[item.id];
            const isAcknowledged = alertState?.acknowledged || false;
            const isEscalated = alertState?.escalated || false;

            return (
              <Card variant="glass" key={item.id}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.lg }}>
                  <View style={{ width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: item.priority === "Critical" ? colors.rose50 : item.priority === "High" ? colors.amber50 : colors.sky50, alignItems: "center", justifyContent: "center" }}>
                    {item.priority === "Critical" ? <TriangleAlert size={18} color={colors.error} strokeWidth={2} /> : item.priority === "High" ? <AlertCircle size={18} color={colors.warning} strokeWidth={2} /> : <Info size={18} color={colors.info} strokeWidth={2} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" }}>
                      <Badge label={item.priority} type={item.priority} />
                      <Badge label={item.read ? "Read" : "Unread"} type={item.read ? "Completed" : "Pending"} />
                      {isAcknowledged && <Badge label="Acknowledged" type="Completed" />}
                      {isEscalated && <Badge label="Escalated" type="Critical" />}
                    </View>
                    <TouchableOpacity onPress={() => { 
                      const cmpMatch = item.detail.match(/(CMP-\d+-\d+)/i) || item.title.match(/(CMP-\d+-\d+)/i);
                      if (cmpMatch) {
                        const complaint = scopedComplaints.find(c => c.complaintId === cmpMatch[1]);
                        if (complaint) {
                          openComplaintDetail(complaint.id);
                          return;
                        }
                      }

                      const complaintMatch = item.detail.match(/complaint\s*#?(\d+)/i) || item.title.match(/complaint\s*#?(\d+)/i);
                      if (complaintMatch) {
                        const complaint = scopedComplaints.find(c => String(c.id) === complaintMatch[1]);
                        if (complaint) {
                          openComplaintDetail(complaint.id);
                          return;
                        }
                      }

                      const isComplaintRelated = item.title.toLowerCase().includes("complaint") || item.detail.toLowerCase().includes("complaint") || item.title.toLowerCase().includes("issue") || item.detail.toLowerCase().includes("issue");
                      if (isComplaintRelated) {
                        setPage("complaints");
                        return;
                      }

                      const b = scopedBranches.find((br) => br.id === item.branchId); 
                      if (b) openBranchDetail(b.id); 
                    }}>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.md }}>{item.title}</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>{item.detail}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.lg }}>{item.time}</Text>

                    {isAcknowledged && alertState?.acknowledgedAt && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm, backgroundColor: colors.emerald50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
                        <CheckCircle size={12} color={colors.success} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.xs, color: colors.success }}>Acknowledged at {alertState.acknowledgedAt}</Text>
                      </View>
                    )}
                    {isEscalated && alertState?.escalatedAt && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm, backgroundColor: colors.rose50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
                        <TriangleAlert size={12} color={colors.error} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.xs, color: colors.error }}>Escalated at {alertState.escalatedAt}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
                  {!isAcknowledged ? (
                    <TouchableOpacity onPress={() => acknowledgeAlert(item.id)} style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <CheckCircle size={14} color={colors.white} strokeWidth={2} />
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Acknowledge</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ backgroundColor: colors.success + "15", borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <CheckCircle size={14} color={colors.success} strokeWidth={2} />
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.success }}>Acknowledged</Text>
                    </View>
                  )}
                  {!isEscalated ? (
                    <TouchableOpacity onPress={() => escalateAlert(item.id)} style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <TriangleAlert size={14} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>Escalate</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ backgroundColor: colors.rose50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <Shield size={14} color={colors.error} strokeWidth={2} />
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.error }}>Escalated</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card variant="glass">
              <View style={{ alignItems: "center", padding: spacing["4xl"] }}>
                <Bell size={32} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.lg }}>No alerts</Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>No {filter} alerts for the selected filter</Text>
              </View>
            </Card>
          )}
        </View>
      ) : selectedRegion !== "" ? (
        <Card style={{ marginTop: spacing.xl, padding: spacing.xl, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Layers size={24} color={colors.slate300} style={{ marginBottom: spacing.sm }} />
          <Text style={{ fontSize: fontSize.sm, color: colors.slate400 }}>Select a branch or "All Branches" to load alerts</Text>
        </Card>
      ) : null}
    </ScreenWrapper>
  );
}
