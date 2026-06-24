import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { AlertTriangle, Clock, Shield, Search, ChevronDown, Building, CheckCircle2, AlertCircle, Download, User as UserIcon, Monitor, Calendar } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { ComplaintCard } from "../../shared/components/ComplaintCard";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

export function RmComplaintCommandCenter() {
  const { state, setTab, openModal, complaints, branches, users, appliances, requestComplaintUpdate, escalateComplaint, sendComplaintReminder, exportComplaintReport } = useApp();
  const filter = state.tabs.complaints || "open";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("all");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  
  // New Filters
  const [selectedManagerId, setSelectedManagerId] = useState<string | number>("all");
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [selectedApplianceId, setSelectedApplianceId] = useState<string | number>("all");
  const [showApplianceDropdown, setShowApplianceDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<"all"|"7days"|"30days">("all");

  const uniqueVendors = useMemo(() => {
    const vendors = new Set(complaints.map(c => c.vendorId || "Unassigned").filter(Boolean));
    return Array.from(vendors);
  }, [complaints]);

  // Filters Pipeline
  const filteredList = useMemo(() => {
    let list = complaints;

    if (selectedBranchId !== "all") list = list.filter(c => String(c.branchId) === String(selectedBranchId));
    if (selectedManagerId !== "all") list = list.filter(c => String(c.raisedById) === String(selectedManagerId));
    if (selectedVendor !== "all") list = list.filter(c => (c.vendorId || "Unassigned") === selectedVendor);
    if (selectedApplianceId !== "all") list = list.filter(c => String(c.assetId) === String(selectedApplianceId));
    if (selectedPriority !== "all") list = list.filter(c => c.priority === selectedPriority);

    if (dateRange !== "all") {
      const cutoff = new Date();
      if (dateRange === "7days") cutoff.setDate(cutoff.getDate() - 7);
      if (dateRange === "30days") cutoff.setDate(cutoff.getDate() - 30);
      list = list.filter(c => new Date(c.createdAt) >= cutoff);
    }

    if (filter !== "all") {
      if (filter === "open") list = list.filter(c => c.status === "OPEN" || c.status === "IN_PROGRESS");
      else if (filter === "vendor") list = list.filter(c => c.status === "VENDOR_PENDING");
      else if (filter === "resolved") list = list.filter(c => c.status === "RESOLVED");
      else if (filter === "critical") list = list.filter(c => c.priority === "Critical" && c.status !== "RESOLVED");
      else if (filter === "aged") {
        list = list.filter(c => {
          const daysOld = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysOld > 7 && c.status !== "RESOLVED";
        });
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.complaintId?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.vendorId?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [complaints, selectedBranchId, selectedManagerId, selectedVendor, selectedApplianceId, selectedPriority, dateRange, filter, searchQuery]);

  // Stats
  const total = complaints.length;
  const openCount = complaints.filter(i => i.status === "OPEN" || i.status === "IN_PROGRESS").length;
  const criticalCount = complaints.filter(i => i.priority === "Critical" && i.status !== "RESOLVED").length;
  const vendorPending = complaints.filter(i => i.status === "VENDOR_PENDING").length;
  const resolvedCount = complaints.filter(i => i.status === "RESOLVED").length;
  
  const nowTime = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;
  const aged7 = complaints.filter(i => (nowTime - new Date(i.createdAt).getTime()) / dayMs > 7 && i.status !== "RESOLVED").length;
  const aged15 = complaints.filter(i => (nowTime - new Date(i.createdAt).getTime()) / dayMs > 15 && i.status !== "RESOLVED").length;
  
  const currentMonth = new Date().getMonth();
  const resolvedThisMonth = complaints.filter(i => {
    if (i.status !== "RESOLVED") return false;
    return new Date(i.resolvedAt || i.resolvedAt || i.createdAt).getMonth() === currentMonth;
  }).length;

  const selectedBranch = branches.find(b => String(b.id) === String(selectedBranchId));
  const selectedManager = users.find(u => String(u.id) === String(selectedManagerId));
  const selectedAppliance = appliances.find(a => String(a.id) === String(selectedApplianceId));

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <SectionHeader title="Complaint Command Center" subtitle="Monitoring & Governance" />
        <TouchableOpacity onPress={exportComplaintReport} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.brand }}>
          <Download size={14} color={colors.brand} />
          <Text style={{ fontSize: fontSize.xs, fontWeight: "600", color: colors.brand }}>Export Report</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Cards */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="Total" value={String(total)} meta="All complaints" accent={colors.brand} icon={Shield} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="OPEN" value={String(openCount)} meta="Active issues" accent={colors.warning} icon={AlertCircle} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="Critical" value={String(criticalCount)} meta="Urgent" accent={colors.error} icon={AlertTriangle} />
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="Vendor" value={String(vendorPending)} meta="Awaiting response" accent={colors.info} icon={Clock} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label="RESOLVED" value={String(resolvedThisMonth)} meta="This Month" accent={colors.success} icon={CheckCircle2} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <StatCard label=">15 Days" value={String(aged15)} meta="Older than 15d" accent={colors.orange500} icon={Clock} />
        </View>
      </View>

      {/* Filters Row 1 */}
      <View style={{ marginTop: spacing["2xl"], gap: spacing.md, zIndex: 30 }}>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {/* Branch Dropdown */}
          <View style={{ flex: 1, zIndex: showBranchDropdown ? 50 : 1, elevation: showBranchDropdown ? 5 : 0 }}>
            <TouchableOpacity onPress={() => setShowBranchDropdown(!showBranchDropdown)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Building size={14} color={colors.brand} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: "500", color: colors.text }} numberOfLines={1}>
                  {selectedBranchId === "all" ? "All Branches" : selectedBranch?.name || "Select"}
                </Text>
              </View>
              <ChevronDown size={14} color={colors.slate400} />
            </TouchableOpacity>
            {showBranchDropdown && (
              <View style={{ position: "absolute", top: 50, left: 0, right: 0, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, maxHeight: 200, zIndex: 10 }}>
                <ScrollView nestedScrollEnabled>
                  <TouchableOpacity onPress={() => { setSelectedBranchId("all"); setShowBranchDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.text }}>All Branches</Text>
                  </TouchableOpacity>
                  {branches.map(b => (
                    <TouchableOpacity key={String(b.id)} onPress={() => { setSelectedBranchId(b.id); setShowBranchDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Manager Dropdown */}
          <View style={{ flex: 1, zIndex: showManagerDropdown ? 50 : 1, elevation: showManagerDropdown ? 5 : 0 }}>
            <TouchableOpacity onPress={() => setShowManagerDropdown(!showManagerDropdown)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <UserIcon size={14} color={colors.brand} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: "500", color: colors.text }} numberOfLines={1}>
                  {selectedManagerId === "all" ? "All Managers" : selectedManager?.name || "Select"}
                </Text>
              </View>
              <ChevronDown size={14} color={colors.slate400} />
            </TouchableOpacity>
            {showManagerDropdown && (
              <View style={{ position: "absolute", top: 50, left: 0, right: 0, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, maxHeight: 200, zIndex: 10 }}>
                <ScrollView nestedScrollEnabled>
                  <TouchableOpacity onPress={() => { setSelectedManagerId("all"); setShowManagerDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.text }}>All Managers</Text>
                  </TouchableOpacity>
                  {users.filter(u => u.role === "branchManager" || u.role === "lc").map(u => (
                    <TouchableOpacity key={String(u.id)} onPress={() => { setSelectedManagerId(u.id); setShowManagerDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{u.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Filters Row 2 */}
        <View style={{ flexDirection: "row", gap: spacing.md, zIndex: 20 }}>
          {/* Vendor Dropdown */}
          <View style={{ flex: 1, zIndex: showVendorDropdown ? 50 : 1, elevation: showVendorDropdown ? 5 : 0 }}>
            <TouchableOpacity onPress={() => setShowVendorDropdown(!showVendorDropdown)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Shield size={14} color={colors.brand} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: "500", color: colors.text }} numberOfLines={1}>
                  {selectedVendor === "all" ? "All Vendors" : selectedVendor}
                </Text>
              </View>
              <ChevronDown size={14} color={colors.slate400} />
            </TouchableOpacity>
            {showVendorDropdown && (
              <View style={{ position: "absolute", top: 50, left: 0, right: 0, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, maxHeight: 200, zIndex: 10 }}>
                <ScrollView nestedScrollEnabled>
                  <TouchableOpacity onPress={() => { setSelectedVendor("all"); setShowVendorDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.text }}>All Vendors</Text>
                  </TouchableOpacity>
                  {uniqueVendors.map(v => (
                    <TouchableOpacity key={v} onPress={() => { setSelectedVendor(v); setShowVendorDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Appliance Dropdown */}
          <View style={{ flex: 1, zIndex: showApplianceDropdown ? 50 : 1, elevation: showApplianceDropdown ? 5 : 0 }}>
            <TouchableOpacity onPress={() => setShowApplianceDropdown(!showApplianceDropdown)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Monitor size={14} color={colors.brand} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: "500", color: colors.text }} numberOfLines={1}>
                  {selectedApplianceId === "all" ? "All Appliances" : selectedAppliance?.name || "Select"}
                </Text>
              </View>
              <ChevronDown size={14} color={colors.slate400} />
            </TouchableOpacity>
            {showApplianceDropdown && (
              <View style={{ position: "absolute", top: 50, left: 0, right: 0, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, maxHeight: 200, zIndex: 10 }}>
                <ScrollView nestedScrollEnabled>
                  <TouchableOpacity onPress={() => { setSelectedApplianceId("all"); setShowApplianceDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.text }}>All Appliances</Text>
                  </TouchableOpacity>
                  {appliances.map(a => (
                    <TouchableOpacity key={String(a.id)} onPress={() => { setSelectedApplianceId(a.id); setShowApplianceDropdown(false); }} style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{a.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Date Range & Priority Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ zIndex: 1 }}>
          <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
            <Calendar size={14} color={colors.slate500} style={{ marginRight: spacing.xs }} />
            {["all", "7days", "30days"].map(dr => (
              <TouchableOpacity key={dr} onPress={() => setDateRange(dr as any)} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, backgroundColor: dateRange === dr ? colors.slate900 : colors.white, borderColor: dateRange === dr ? colors.slate900 : colors.border }}>
                <Text style={{ fontSize: 11, fontWeight: "500", color: dateRange === dr ? colors.white : colors.slate700 }}>
                  {dr === "all" ? "All Time" : dr === "7days" ? "Last 7 Days" : "Last 30 Days"}
                </Text>
              </TouchableOpacity>
            ))}
            
            <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: spacing.xs }} />
            
            {["all", "Critical", "High", "Medium", "Low"].map(p => (
              <TouchableOpacity key={p} onPress={() => setSelectedPriority(p)} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, backgroundColor: selectedPriority === p ? colors.brand : colors.white, borderColor: selectedPriority === p ? colors.brand : colors.border }}>
                <Text style={{ fontSize: 11, fontWeight: "500", color: selectedPriority === p ? colors.white : colors.slate700 }}>
                  {p === "all" ? "All Priority" : p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Status Filter Tabs */}
      <View style={{ marginTop: spacing.xl, zIndex: 1 }}>
        <SegmentedControl
          tabs={[
            { label: "OPEN", value: "open" },
            { label: "Vendor", value: "vendor" },
            { label: "Critical", value: "critical" },
            { label: "Aged", value: "aged" },
            { label: "RESOLVED", value: "resolved" },
            { label: "All", value: "all" },
          ]}
          activeKey={filter}
          onChange={(v) => setTab("complaints", v)}
        />
      </View>

      {/* Search */}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xl, zIndex: 1 }}>
        <Search size={16} color={colors.slate400} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by CMP number, vendor, description..."
          placeholderTextColor={colors.slate400}
          style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }}
        />
      </View>

      {/* Results Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.md, zIndex: 1 }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.textSecondary }}>{filteredList.length} complaint{filteredList.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Complaint List */}
      <View style={{ gap: spacing.md, zIndex: 1 }}>
        {filteredList.map((item) => (
          <ComplaintCard
            key={String(item.id)}
            item={item}
            showRaiseToVendor={false}
            actions={[
              ...(item.status !== "RESOLVED" ? [
                { label: "Resolve", onPress: () => openModal("resolveComplaint", { id: item.id }), primary: true },
                { label: "Request Update", onPress: () => requestComplaintUpdate(item.id), warning: true },
                { label: "Send Reminder", onPress: () => sendComplaintReminder(item.id), warning: true },
              ] : []),
            ]}
          />
        ))}
        {filteredList.length === 0 && (
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>
            No complaints match your filters
          </Text>
        )}
      </View>
    </ScreenWrapper>
  );
}
