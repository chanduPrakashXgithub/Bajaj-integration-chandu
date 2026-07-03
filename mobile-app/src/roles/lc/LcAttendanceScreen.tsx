import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { CheckCircle2, Clock, XCircle, CalendarDays, Plus, Trash2, Send, ListChecks, UserCheck, UserX } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { WeeklyTaskItem } from "../../types/domain";

type SubTab = "mark" | "history";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "mark", label: "Mark" },
  { key: "history", label: "My Calendar" },
];

export function LcAttendanceScreen() {
  const { scopedAttendance, scopedTasks, scopedUsers, state, getBranch, currentUser, markAttendance, showToast } = useApp();
  const branch = getBranch(currentUser.branchId);
  const [subTab, setSubTab] = useState<SubTab>("mark");

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTaskItem[]>([
    { id: "1", description: "", estimatedHours: 0 },
  ]);
  const [remarks, setRemarks] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const todayAttendance = scopedAttendance.filter((a) => a.date === state.today);
  const myToday = todayAttendance.find((a) => a.userId === currentUser.id);
  const isPresent = myToday?.status === "Present" || myToday?.status === "Late";

  const addTaskRow = () => {
    setWeeklyTasks((prev) => [...prev, { id: String(prev.length + 1), description: "", estimatedHours: 0 }]);
  };

  const removeTaskRow = (id: string) => {
    if (weeklyTasks.length <= 1) return;
    setWeeklyTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskRow = (id: string, field: keyof WeeklyTaskItem, value: string | number) => {
    setWeeklyTasks((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const branchUsers = scopedUsers.filter((u) => u.branchId === branch?.id);
  const presentCount = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const absentCount = Math.max(0, branchUsers.length - presentCount);

  const handleMarkAttendance = () => {
    markAttendance({ isBranchOpening: true, remarks: "", photos: [], weeklyTasks: [] });
  };

  return (
    <ScreenWrapper>
      <SectionHeader title="Branch Opening" />
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
        <SegmentedControl
          tabs={SUB_TABS.map((t) => ({ label: t.label, value: t.key }))}
          activeKey={subTab}
          onChange={(v) => setSubTab(v as SubTab)}
        />
      </View>

      {subTab === "mark" && renderMark()}
      {subTab === "history" && renderHistory()}
    </ScreenWrapper>
  );

  function renderMark() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          <View style={{ flex: 1, minWidth: 120 }}><StatCard label="Present" value={String(presentCount)} meta="Verified geo attendance" accent={colors.success} icon={UserCheck} /></View>
          <View style={{ flex: 1, minWidth: 120 }}><StatCard label="Absent" value={String(absentCount)} meta="No punch today" accent={colors.error} icon={UserX} /></View>
        </View>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Send size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Complete Branch Opening</Text>
          </View>

          {isPresent ? (
            <View style={{ backgroundColor: colors.emerald50, borderRadius: borderRadius.lg, padding: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.success }}>Branch Opening marked today at {myToday.checkIn}</Text>
            </View>
          ) : (
            <View style={{ gap: spacing.xl }}>




              <TouchableOpacity onPress={handleMarkAttendance} style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: spacing.sm }}>
                <Send size={14} color={colors.white} strokeWidth={2} />
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Submit Branch Opening</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </ScrollView>
    );
  }

  function renderHistory() {
    const myTasks = scopedTasks.filter((t) => t.assignedTo === currentUser.id && t.status === "Completed");

    // Generate dates dynamically (rolling 15 days back from today)
    const calendarDays = Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
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
    });

    let currentMonthLabel = "";
    try {
      currentMonthLabel = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" }).format(new Date());
    } catch (e) {
      currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingBottom: 40 }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>My Calendar - {currentMonthLabel}</Text>
          </View>
          <View style={{ gap: spacing.lg }}>
            {calendarDays.map((date) => {
              const attRecord = scopedAttendance.find((a) => a.userId === currentUser.id && a.date === date);
              // Mock matching tasks completed on this date if the task title contains 'Proof' or if deadline includes the day just to populate data. Since we don't have completedAt in Task, we just assign randomly based on string match for demo.
              const completedOnDate = myTasks.filter((t) => ((String(t.id).charCodeAt(0) || 0) % 26) + 1 === parseInt(date.slice(-2)));

              const isPresent = attRecord?.status === "Present" || attRecord?.status === "Late";

              return (
                <View key={date} style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.md }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: colors.slate100, paddingBottom: spacing.md }}>
                    <Text style={{ fontSize: fontSize.md, fontWeight: "400", color: colors.slate900 }}>{date}</Text>
                    <Badge label={isPresent ? "Present" : "Absent"} type={isPresent ? "Completed" : "Pending"} />
                  </View>

                  {completedOnDate.length > 0 ? (
                    <View style={{ gap: spacing.sm, paddingTop: spacing.xs }}>
                      <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase" }}>Completed Tasks</Text>
                      {completedOnDate.map((task) => (
                        <View key={task.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                          <ListChecks size={14} color={colors.success} />
                          <Text style={{ fontSize: fontSize.sm, color: colors.slate700 }}>{task.title}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ paddingTop: spacing.xs }}>
                      <Text style={{ fontSize: fontSize.sm, color: colors.slate400, fontStyle: "italic" }}>No checks completed</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    );
  }
}
