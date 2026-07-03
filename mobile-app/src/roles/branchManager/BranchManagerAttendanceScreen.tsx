import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { CheckCircle2, CalendarDays, Send, Plus, Trash2 } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";
import { WeeklyTaskItem } from "../../types/domain";

export function BranchManagerAttendanceScreen() {
  const { scopedAttendance, state, currentUser, markAttendance, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("mark");
  const [remarks, setRemarks] = useState("");
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTaskItem[]>([
    { id: "1", description: "", estimatedHours: 0 },
  ]);

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

  const myAttendance = scopedAttendance.filter((a) => String(a.userId) === String(currentUser?.id));
  const myToday = myAttendance.find((a) => a.date === state.today);
  const isPresent = myToday?.status === "Present" || myToday?.status === "Late";

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

  const handleMarkAttendance = () => {
    markAttendance({ remarks, weeklyTasks: weeklyTasks.filter(t => t.description.trim() !== "") });
  };

  return (
    <ScreenWrapper>
      <SectionHeader title="My Attendance" />
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
        <SegmentedControl
          tabs={[
            { label: "Mark Attendance", value: "mark" },
            { label: "My History", value: "history" },
          ]}
          activeKey={activeTab}
          onChange={(v) => setActiveTab(v)}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingBottom: 40 }}>
        {activeTab === "mark" && (
          <Card variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                <Send size={16} color={colors.brand} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Mark your attendance</Text>
            </View>

            {isPresent ? (
              <View style={{ backgroundColor: colors.emerald50, borderRadius: borderRadius.lg, padding: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.success }}>Attendance marked today at {myToday?.checkIn}</Text>
              </View>
            ) : (
              <View style={{ gap: spacing.md }}>
                <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.slate700 }}>Tasks / Checks Planned</Text>
                    <TouchableOpacity onPress={addTaskRow} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Plus size={14} color={colors.brand} />
                      <Text style={{ fontSize: fontSize.xs, color: colors.brand, fontWeight: "600" }}>Add Task</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {weeklyTasks.map((task, index) => (
                    <View key={task.id} style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
                      <TextInput
                        value={task.description}
                        onChangeText={(val) => updateTaskRow(task.id, "description", val)}
                        placeholder="Task description..."
                        placeholderTextColor={colors.slate400}
                        style={{ flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }}
                      />
                      <TextInput
                        value={String(task.estimatedHours || "")}
                        onChangeText={(val) => updateTaskRow(task.id, "estimatedHours", parseFloat(val) || 0)}
                        placeholder="Hrs"
                        placeholderTextColor={colors.slate400}
                        keyboardType="numeric"
                        style={{ width: 60, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, color: colors.slate900, fontSize: fontSize.sm, textAlign: "center" }}
                      />
                      {weeklyTasks.length > 1 && (
                        <TouchableOpacity onPress={() => removeTaskRow(task.id)} style={{ justifyContent: "center", paddingHorizontal: spacing.xs }}>
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: "500", color: colors.slate700, marginBottom: spacing.xs }}>Daily Remarks</Text>
                  <TextInput
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Enter any additional remarks..."
                    placeholderTextColor={colors.slate400}
                    style={{ fontSize: fontSize.sm, color: colors.slate900, minHeight: 80, textAlignVertical: "top" }}
                    multiline
                  />
                </View>
                <TouchableOpacity onPress={handleMarkAttendance} style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: spacing.sm }}>
                  <Send size={14} color={colors.white} strokeWidth={2} />
                  <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Mark Attendance Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {activeTab === "history" && (
          <Card variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
                <CalendarDays size={16} color={colors.brand} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>My Calendar - {currentMonthLabel}</Text>
            </View>

            <View style={{ gap: spacing.lg }}>
              {calendarDays.map((date) => {
                const attRecord = scopedAttendance.find((a) => String(a.userId) === String(currentUser?.id) && a.date === date);
                const wasPresent = attRecord?.status === "Present" || attRecord?.status === "Late";
                const todoText = attRecord?.remarks || (attRecord?.weeklyTasks || []).map((t) => t.description).filter(Boolean).join(", ");

                return (
                  <View key={date} style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.md }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: colors.slate100, paddingBottom: spacing.md }}>
                      <Text style={{ fontSize: fontSize.md, fontWeight: "400", color: colors.slate900 }}>{date}</Text>
                      <Badge label={wasPresent ? "Present" : "Absent"} type={wasPresent ? "Completed" : "Pending"} />
                    </View>

                    {todoText ? (
                      <View style={{ gap: spacing.sm, paddingTop: spacing.xs }}>
                        <Text style={{ fontSize: fontSize.xs, color: colors.slate500, textTransform: "uppercase" }}>Daily To-Do / Tasks</Text>
                        <View style={{ backgroundColor: colors.slate50, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.slate100 }}>
                          <Text style={{ fontSize: fontSize.sm, color: colors.slate700 }}>{todoText}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={{ paddingTop: spacing.xs }}>
                        <Text style={{ fontSize: fontSize.sm, color: colors.slate400, fontStyle: "italic" }}>No tasks recorded</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
