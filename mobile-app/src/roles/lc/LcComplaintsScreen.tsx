import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { AlertCircle, Clock, CheckCircle2, Send, Search, Plus, XCircle } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { ComplaintCard } from "../../shared/components/ComplaintCard";
import { RaiseComplaintModal } from "../../modals/forms/RaiseComplaintModal";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

export function LcComplaintsScreen() {
  const { state, setTab, scopedComplaints, updateComplaintStatus, closeComplaint } = useApp();
  const filter = state.tabs.complaints;
  const [searchQuery, setSearchQuery] = useState("");
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  const statusFiltered = useMemo(() => scopedComplaints.filter((item) => {
    if (filter === "all") return true;
    if (filter === "open") return item.status === "OPEN" || item.status === "IN_PROGRESS";
    if (filter === "vendor") return item.status === "VENDOR_PENDING" || item.status === "ON_HOLD";
    if (filter === "resolved") return item.status === "RESOLVED";
    return true;
  }), [scopedComplaints, filter]);

  const list = useMemo(() => statusFiltered.filter((c) =>
    c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vendorId?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [statusFiltered, searchQuery]);

  const openCount = scopedComplaints.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS").length;
  const vendorPending = scopedComplaints.filter((i) => i.status === "VENDOR_PENDING" || i.status === "ON_HOLD").length;
  const criticalCount = scopedComplaints.filter((i) => i.priority === "Critical" && i.status !== "RESOLVED").length;
  const resolvedCount = scopedComplaints.filter((i) => i.status === "RESOLVED").length;

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Complaints"
        action={
          <TouchableOpacity
            onPress={() => setShowRaiseModal(true)}
            style={{
              flexDirection: "row", alignItems: "center", gap: spacing.sm,
              backgroundColor: colors.brand, borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
            }}
          >
            <Plus size={16} color={colors.white} strokeWidth={2.5} />
            <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.white }}>Raise Complaint</Text>
          </TouchableOpacity>
        }
      />

      {/* Dashboard Cards */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="OPEN" value={String(openCount)} meta="Active issues" accent={colors.warning} icon={AlertCircle} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="Vendor Pending" value={String(vendorPending)} meta="Awaiting vendor" accent={colors.info} icon={Clock} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="Critical" value={String(criticalCount)} meta="Needs attention" accent={colors.error} icon={XCircle} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="RESOLVED" value={String(resolvedCount)} meta="Completed" accent={colors.success} icon={CheckCircle2} />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ marginTop: spacing.xl }}>
        <SegmentedControl
          tabs={[
            { label: "OPEN", value: "open" },
            { label: "Vendor", value: "vendor" },
            { label: "RESOLVED", value: "resolved" },
            { label: "All", value: "all" },
          ]}
          activeKey={filter}
          onChange={(v) => setTab("complaints", v)}
        />
      </View>

      {/* Search */}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xl }}>
        <Search size={16} color={colors.slate400} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search complaints, vendors..."
          placeholderTextColor={colors.slate400}
          style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }}
        />
      </View>

      {/* Complaint List */}
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {list.map((item) => (
          <ComplaintCard
            key={String(item.id)}
            item={item}
            actions={
              item.status === "OPEN" ? [
                { label: "Mark In Progress", onPress: () => updateComplaintStatus(item.id, "IN_PROGRESS"), primary: true },
              ] : undefined
            }
          />
        ))}
        {list.length === 0 && (
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>
            No complaints found for this filter
          </Text>
        )}
      </View>

      <RaiseComplaintModal visible={showRaiseModal} onClose={() => setShowRaiseModal(false)} />
    </ScreenWrapper>
  );
}
