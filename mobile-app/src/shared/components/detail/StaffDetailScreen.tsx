import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import {
  User, Phone, Mail, Clock, Smartphone, Award, FileText, CalendarDays,
  ChevronRight, MapPin, Star, TrendingUp, CheckCircle2, AlertTriangle,
  Camera, Shield, Briefcase, X, ListChecks
} from "lucide-react-native";
import { ScreenWrapper } from "../../../shared/layout/ScreenWrapper";
import { Card } from "../../../shared/components/Card";
import { Badge } from "../../../shared/components/Badge";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { SegmentedControl } from "../../../shared/components/SegmentedControl";
import { useApp } from "../../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../../theme/theme";
import { User as DomainUser, Task, AttendanceLog, WeeklyTaskItem } from "../../../types/domain";

interface Props {
  userId: string | number;
  onBack: () => void;
}

type SubTab = "overview" | "attendance" | "tasks";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance" },
  { key: "tasks", label: "Tasks & Proof" },
];

export function StaffDetailScreen({ userId, onBack }: Props) {
  const { getUser, getBranch, scopedTasks, scopedAttendance, scopedComplaints } = useApp();
  const user = getUser(userId);
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  if (!user) return null;

  const branch = getBranch(user.branchId);
  const userTasks = scopedTasks.filter((t: Task) => String(t.assignedTo) === String(userId));
  const userAttendance = scopedAttendance.filter((a: AttendanceLog) => String(a.userId) === String(userId));
  const pendingTasks = userTasks.filter((t: Task) => t.status === "Pending").length;
  const completedTasks = userTasks.filter((t: Task) => t.status === "Completed").length;

  const filteredAttendance = useMemo(() => {
    if (!fromDate && !toDate) return userAttendance;
    return userAttendance.filter((a: AttendanceLog) => {
      if (fromDate && a.date < fromDate) return false;
      if (toDate && a.date > toDate) return false;
      return true;
    });
  }, [fromDate, toDate, userAttendance]);

  const detailRows = [
    { label: "Phone", value: user.phone, icon: Phone },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Shift", value: user.shift, icon: Clock },
    { label: "Device ID", value: user.deviceId, icon: Smartphone },
    { label: "Emergency", value: user.emergencyContact, icon: Shield },
    { label: "Join date", value: user.joinDate, icon: CalendarDays },
  ];

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={18} color={colors.text} strokeWidth={2} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, flex: 1 }}>Staff Details</Text>
      </View>

      <View style={{ marginBottom: spacing.xl }}>
        <SegmentedControl
          tabs={SUB_TABS.map((t) => ({ label: t.label, value: t.key }))}
          activeKey={subTab}
          onChange={(v) => setSubTab(v as SubTab)}
        />
      </View>

      {subTab === "overview" && renderOverview(user)}
      {subTab === "attendance" && renderAttendance()}
      {subTab === "tasks" && renderTasks()}
    </ScreenWrapper>
  );

  function renderOverview(user: DomainUser) {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingBottom: 40 }}>
        <Card variant="soft" style={{ backgroundColor: colors.text, marginBottom: spacing.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xl }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandLight, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.brand }}>
                {user.name.split(" ").map((n) => n[0]).join("")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.white }}>{user.name}</Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.slate300, marginTop: spacing.xs }}>{user.position}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.brand + "50", alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand }} />
                </View>
                <Text style={{ fontSize: fontSize.xs, color: colors.slate300 }}>{branch?.name}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: user.rating >= 4.5 ? colors.emerald500 + "30" : colors.amber500 + "30", alignItems: "center", justifyContent: "center" }}>
                <Star size={20} color={user.rating >= 4.5 ? colors.emerald200 : colors.amber200} fill={user.rating >= 4.5 ? colors.emerald200 : colors.amber200} />
              </View>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white, marginTop: spacing.xs }}>{user.rating.toFixed(1)}</Text>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginBottom: spacing.xl }}>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.text }}>{user.attendancePct}%</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Attendance</Text>
          </View>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.text }}>{user.tasksClosed}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Tasks done</Text>
          </View>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.text }}>{user.escalations}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Escalations</Text>
          </View>
        </View>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Contact & Device</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {detailRows.map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{row.label}</Text>
                </View>
                <Text numberOfLines={1} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 180 }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Award size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Skills & Performance</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {user.skills.map((skill) => (
              <View key={skill} style={{ backgroundColor: colors.slate100, borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.textSecondary }}>{skill}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: spacing.xl, backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Attendance rate</Text>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{user.attendancePct}%</Text>
            </View>
            <ProgressBar value={user.attendancePct} color={user.attendancePct >= 95 ? colors.success : user.attendancePct >= 90 ? colors.warning : colors.error} />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md }}>
            <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Camera size={14} color={colors.brand} />
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Proof rate</Text>
              </View>
              <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{user.proofRate}%</Text>
            </View>
            <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Tasks closed</Text>
              </View>
              <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{user.tasksClosed}</Text>
            </View>
          </View>
        </Card>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Documents</Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {user.documents.map((doc) => (
              <View key={doc} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <FileText size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text numberOfLines={1} style={{ fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 }}>{doc}</Text>
                </View>
                <Text style={{ fontSize: fontSize.sm, color: colors.success, fontWeight: "400" }}>Verified</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    );
  }

  function renderAttendance() {
    const presentCount = filteredAttendance.filter((a) => a.status === "Present").length;
    const lateCount = filteredAttendance.filter((a) => a.status === "Late").length;
    const absentCount = filteredAttendance.filter((a) => a.status === "Absent").length;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingBottom: 40 }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Date filter</Text>
            {(fromDate || toDate) && (
              <TouchableOpacity onPress={() => { setFromDate(""); setToDate(""); }} style={{ padding: spacing.sm }}>
                <X size={14} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.textSecondary, marginBottom: spacing.sm }}>From date</Text>
              <TextInput
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.slate400}
                style={{ borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, fontSize: fontSize.sm, color: colors.text }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.textSecondary, marginBottom: spacing.sm }}>To date</Text>
              <TextInput
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.slate400}
                style={{ borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, fontSize: fontSize.sm, color: colors.text }}
              />
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg }}>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
            <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{presentCount}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Present</Text>
          </View>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Clock size={16} color={colors.warning} strokeWidth={2} />
            <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{lateCount}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Late</Text>
          </View>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <AlertTriangle size={16} color={colors.error} strokeWidth={2} />
            <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{absentCount}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Absent</Text>
          </View>
        </View>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <ListChecks size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>
              Records {fromDate || toDate ? `(${filteredAttendance.length})` : ""}
            </Text>
          </View>
          <View style={{ gap: spacing.md }}>
            {filteredAttendance.slice().reverse().map((entry: AttendanceLog) => (
              <View key={entry.id} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: entry.status === "Present" ? colors.success + "15" : entry.status === "Late" ? colors.warning + "15" : colors.error + "15", alignItems: "center", justifyContent: "center" }}>
                      {entry.status === "Present" ? <CheckCircle2 size={14} color={colors.success} strokeWidth={2} /> : entry.status === "Late" ? <Clock size={14} color={colors.warning} strokeWidth={2} /> : <AlertTriangle size={14} color={colors.error} strokeWidth={2} />}
                    </View>
                    <View>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{entry.date}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{entry.checkIn} | {entry.location}</Text>
                    </View>
                  </View>
                  <Badge label={entry.status} type={entry.status as any} />
                </View>
                <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
                  <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.sm, alignItems: "center" }}>
                    <Camera size={12} color={colors.brandSecondary} strokeWidth={2} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Proof</Text>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: entry.proof === "submitted" ? colors.success : colors.textSecondary }}>{entry.proof}</Text>
                  </View>
                  {entry.weeklyTasks && entry.weeklyTasks.length > 0 && (
                    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.sm }}>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" }}>Tasks planned</Text>
                      {entry.weeklyTasks.map((wt: WeeklyTaskItem) => (
                        <Text key={wt.id} style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.text, marginTop: spacing.xs }}>{wt.description} ({wt.estimatedHours}h)</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
            {filteredAttendance.length === 0 && (
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>No attendance records found</Text>
            )}
          </View>
        </Card>
      </ScrollView>
    );
  }

  function renderTasks() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg }}>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text }}>{userTasks.length}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Total tasks</Text>
          </View>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text }}>{pendingTasks}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Pending</Text>
          </View>
          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: fontSize["2xl"], fontWeight: "400", color: colors.text }}>{completedTasks}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Completed</Text>
          </View>
        </View>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Task history</Text>
          </View>
          <View style={{ gap: spacing.md }}>
            {userTasks.slice().reverse().map((task: Task) => (
              <View key={task.id} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center", flexWrap: "wrap" }}>
                      <Badge label={task.status} type={task.status as any} />
                      <Badge label={task.priority} type={task.priority} />
                      {task.proofRequired && (
                        <View style={{ backgroundColor: colors.brandLight, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                          <Camera size={10} color={colors.brand} strokeWidth={2} />
                          <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.brand }}>Proof</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{task.title}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>
                      {task.zone} | {task.schedule} | {task.checklistDone}/{task.checklistTotal} checklist
                    </Text>
                  </View>
                </View>
                {task.notes ? (
                  <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.sm }}>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Notes: {task.notes}</Text>
                  </View>
                ) : null}
                {task.status === "Completed" && task.completedAt && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
                    <CheckCircle2 size={12} color={colors.success} strokeWidth={2} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.success }}>Completed at {task.completedAt}</Text>
                  </View>
                )}
                {task.status === "Revoked" && task.redoReason && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
                    <AlertTriangle size={12} color={colors.error} strokeWidth={2} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.error }}>Redo: {task.redoReason}</Text>
                  </View>
                )}
              </View>
            ))}
            {userTasks.length === 0 && (
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing["4xl"] }}>No checks assigned</Text>
            )}
          </View>
        </Card>
      </ScrollView>
    );
  }
}
