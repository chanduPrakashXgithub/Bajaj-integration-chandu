import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { CheckCircle, XCircle, Clock, Stamp, DollarSign, Search, Calendar } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { formatMoney } from "../../utils/helpers";

export function BranchManagerApprovalsScreen() {
  const { state, setTab, scopedApprovals, getBranch, approveRequest, rejectRequest } = useApp();
  const activeTab = state.tabs.approvals || "pending";
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("2026-04-20");
  const [toDate, setToDate] = useState("2026-04-26");

  const statusFiltered = scopedApprovals.filter((a) => {
    if (activeTab === "pending") return a.status === "Pending";
    if (activeTab === "approved") return a.status === "Approved";
    if (activeTab === "rejected") return a.status === "Rejected";
    return true;
  });

  const filteredApprovals = statusFiltered.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.kind.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = scopedApprovals.filter((a) => a.status === "Pending").length;
  const approvedCount = scopedApprovals.filter((a) => a.status === "Approved").length;
  const rejectedCount = scopedApprovals.filter((a) => a.status === "Rejected").length;

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Approval Queue"
        action={
          <SegmentedControl
            tabs={[
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
            activeKey={activeTab}
            onChange={(v) => setTab("approvals", v)}
          />
        }
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 2, minWidth: 200, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search approvals..." 
            placeholderTextColor={colors.slate400}
            style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }} 
          />
        </View>
        <View style={{ flex: 1, minWidth: 140, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Calendar size={16} color={colors.slate400} />
          <TextInput value={fromDate} onChangeText={setFromDate} placeholder="From" style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }} />
        </View>
        <View style={{ flex: 1, minWidth: 140, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Calendar size={16} color={colors.slate400} />
          <TextInput value={toDate} onChangeText={setToDate} placeholder="To" style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }} />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.warning + "15", alignItems: "center", justifyContent: "center" }}>
              <Stamp size={16} color={colors.warning} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>
              {activeTab === "pending" ? "Pending Requests" : activeTab === "approved" ? "Approved Requests" : "Rejected Requests"}
            </Text>
          </View>
          <View style={{ gap: spacing.xl }}>
            {filteredApprovals.length > 0 ? filteredApprovals.map((a) => {
              const branch = getBranch(a.branchId);
              return (
                <View key={a.id} style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" }}>
                        <Badge label={a.status} type={a.status} />
                        <Badge label={a.priority} type={a.priority} />
                        <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.textSecondary, textTransform: "uppercase" }}>{a.kind}</Text>
                      </View>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.lg }}>{a.title}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
                        <DollarSign size={12} color={colors.textSecondary} />
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{branch?.name} | {formatMoney(a.amount)} | Stage: {a.stage}</Text>
                      </View>
                      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>{a.note}</Text>
                    </View>
                  </View>
                  {a.status === "Pending" ? (
                    <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl }}>
                      <TouchableOpacity onPress={() => approveRequest(a.id)} style={{ backgroundColor: colors.success, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <CheckCircle size={14} color={colors.white} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => rejectRequest(a.id)} style={{ backgroundColor: colors.error, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <XCircle size={14} color={colors.white} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: spacing.sm }}>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Age: {a.age}</Text>
                  </View>
                </View>
              );
            }) : (
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", padding: spacing["4xl"] }}>No approvals to show</Text>
            )}
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
