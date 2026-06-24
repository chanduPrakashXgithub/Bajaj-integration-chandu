import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Timer, FileCheck, PlayCircle, Search } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { DatePickerDropdown } from "../../shared/components/DatePickerDropdown";
import { FilterDropdown } from "../../shared/components/FilterDropdown";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { TaskCard } from "../../shared/components/TaskCard";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

export function LcTasksScreen() {
  const { currentUser, scopedTasks, openTaskDetail } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const STATUS_OPTIONS = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ];
  const getPastDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    try {
      const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" } as const;
      const formatter = new Intl.DateTimeFormat("en-CA", options);
      return formatter.format(d);
    } catch (e) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  };
  const getFutureDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    try {
      const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" } as const;
      const formatter = new Intl.DateTimeFormat("en-CA", options);
      return formatter.format(d);
    } catch (e) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  };

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const myChecks = scopedTasks.filter((t) =>
    t.assignedTo === currentUser.id ||
    (t.assignedTo == null && t.audience === "lc" && String(t.branchId) === String(currentUser.branchId))
  );
  const weeklyChecks = myChecks.filter((t) => t.schedule === "Weekly");

  const list = weeklyChecks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const taskDate = t.deadline ? String(t.deadline).slice(0, 10) : "";
    let matchesDate = true;
    if (fromDate && taskDate < fromDate) matchesDate = false;
    if (toDate && taskDate > toDate) matchesDate = false;
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    if ((a.status === "Pending" || a.status === "In Progress") && b.status === "Completed") return -1;
    if (a.status === "Completed" && (b.status === "Pending" || b.status === "In Progress")) return 1;
    return 0;
  });

  const pending = list.filter((t) => t.status === "Pending" || t.status === "In Progress").length;
  const completed = list.filter((t) => t.status === "Completed").length;

  return (
    <ScreenWrapper>
      <SectionHeader
        title="My checks"
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 120 }}><StatCard label="Pending checks" value={String(pending)} meta="Awaiting completion" accent={colors.brand} icon={Timer} /></View>
        <View style={{ flex: 1, minWidth: 120 }}><StatCard label="Completed checks" value={String(completed)} meta="Proof accepted" accent={colors.success} icon={FileCheck} /></View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 200, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Search size={16} color={colors.slate400} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search checks..."
            placeholderTextColor={colors.slate400}
            style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }}
          />
          <View style={{ width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: spacing.xs }} />
          <FilterDropdown value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} placeholder="Status" />
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1, minWidth: 140, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <DatePickerDropdown value={fromDate} onChange={setFromDate} placeholder="From" />
        </View>
        <View style={{ flex: 1, minWidth: 140, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <DatePickerDropdown value={toDate} onChange={setToDate} placeholder="To" />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.xl }}>
        {list.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            actions={task.status === "Pending" || task.status === "In Progress" ? [
              { label: "Submit Proof", onPress: () => openTaskDetail(task.id), primary: true },
            ] : undefined}
          />
        ))}
        {list.length === 0 && (
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>No checks found for this filter</Text>
        )}
      </View>
    </ScreenWrapper>
  );
}
