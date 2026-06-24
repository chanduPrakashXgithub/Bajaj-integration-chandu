import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ClipboardCheck, ChevronRight, Clock, MapPin, Camera, ShieldAlert,
  CheckCircle2, RotateCcw, User, Calendar, AlertTriangle, FileText,
  MessageSquare, ArrowUpRight, ListChecks, UserCheck
} from "lucide-react-native";
import { ScreenWrapper } from "../../../shared/layout/ScreenWrapper";
import { Card } from "../../../shared/components/Card";
import { Badge } from "../../../shared/components/Badge";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { useApp } from "../../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../../theme/theme";
import { countdown } from "../../../utils/helpers";

interface Props {
  taskId: string;
  onBack: () => void;
}

export function TaskDetailScreen({ taskId, onBack }: Props) {
  const { getTask, getBranch, getUser, state, markTaskDone, revokeTask, submitTaskProof, showToast } = useApp();
  const task = getTask(taskId);

  if (!task) return null;

  const branch = getBranch(task.branchId);
  const assignee = task.assignedTo ? getUser(task.assignedTo) : null;
  const assigner = getUser(task.assignedBy);
  const pct = (task.checklistDone / task.checklistTotal) * 100;
  const now = new Date("2026-04-26T11:20:00");
  const deadline = new Date(task.deadline);
  const diff = deadline.getTime() - now.getTime();
  const minsLeft = Math.max(0, Math.floor(diff / 60000));
  const hrsLeft = Math.floor(minsLeft / 60);
  const remMins = minsLeft % 60;
  const timeLeft = diff <= 0 ? "Overdue" : hrsLeft > 0 ? `${hrsLeft}h ${remMins}m left` : `${remMins}m left`;

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={18} color={colors.text} strokeWidth={2} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, flex: 1 }}>Check Details</Text>
      </View>

      <Card variant="soft" style={{ backgroundColor: colors.text, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
              <Badge label={task.status} type={task.status as any} />
              <Badge label={task.priority} type={task.priority} />
            </View>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.white, marginTop: spacing.lg }}>{task.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
              <MapPin size={14} color={colors.slate300} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, color: colors.slate300 }}>{branch?.name} | {task.zone}</Text>
            </View>
          </View>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: diff <= 0 ? colors.rose500 + "30" : colors.amber500 + "30", alignItems: "center", justifyContent: "center" }}>
            <Clock size={24} color={diff <= 0 ? colors.rose200 : colors.amber200} strokeWidth={2} />
          </View>
        </View>
        <Text style={{ fontSize: fontSize["4xl"], fontWeight: "400", color: colors.white, marginTop: spacing.lg }}>{timeLeft}</Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.slate300, marginTop: spacing.xs }}>Deadline: {task.deadline.replace("T", " ")}</Text>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginBottom: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <ListChecks size={16} color={colors.brand} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{task.checklistDone}/{task.checklistTotal}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Checklist</Text>
        </View>
        <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Camera size={16} color={colors.success} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{task.proofRequired ? "Yes" : "No"}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Proof req.</Text>
        </View>
        <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <ShieldAlert size={16} color={colors.warning} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{minsLeft}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Mins left</Text>
        </View>
      </View>

      <View style={{ gap: spacing.xl }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <ClipboardCheck size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Check Information</Text>
          </View>
          <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Progress</Text>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{Math.round(pct)}%</Text>
            </View>
            <ProgressBar value={pct} color={task.status === "Completed" ? colors.success : colors.warning} />
          </View>
          <View style={{ gap: spacing.sm }}>
            {[
              { label: "Schedule", value: task.schedule, icon: Calendar },
              { label: "Zone", value: task.zone, icon: MapPin },
              { label: "Assigned by", value: assigner?.name || "System", icon: User },
              { label: "Assigned to", value: assignee?.name || "Shared task", icon: User },
              { label: "Proof label", value: task.proofLabel, icon: Camera },
              { label: "Escalation", value: task.escalation, icon: ShieldAlert },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <row.icon size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{row.label}</Text>
                </View>
                <Text numberOfLines={2} style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text, maxWidth: 180, textAlign: "right" }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Notes & Instructions</Text>
          </View>
          <View style={{ backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.text, lineHeight: 20 }}>{task.notes}</Text>
          </View>
        </Card>

        {task.redoReason && (
          <Card variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.error + "15", alignItems: "center", justifyContent: "center" }}>
                <RotateCcw size={16} color={colors.error} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.error }}>Redo Required</Text>
            </View>
            <View style={{ backgroundColor: colors.red50, borderRadius: borderRadius.lg, padding: spacing.xl, flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
              <AlertTriangle size={16} color={colors.red700} strokeWidth={2} style={{ marginTop: 2 }} />
              <Text style={{ fontSize: fontSize.sm, color: colors.red700, flex: 1 }}>{task.redoReason}</Text>
            </View>
          </Card>
        )}

        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Escalation Chain</Text>
          </View>
          <View style={{ gap: spacing.md }}>
            {[
              { level: "LC", desc: "Submit geo proof or task stays pending.", color: colors.emerald50, textColor: colors.emerald700, icon: UserCheck },
              { level: "Branch Manager", desc: "Reviews repeated misses and calls branch.", color: colors.sky50, textColor: colors.sky700, icon: ShieldAlert },
              { level: "RM", desc: "Only for safety, audit or repeated failures.", color: colors.rose50, textColor: colors.rose700, icon: ArrowUpRight },
            ].map((step, i) => (
              <View key={i} style={{ backgroundColor: step.color, borderRadius: borderRadius.lg, padding: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: step.textColor + "20", alignItems: "center", justifyContent: "center" }}>
                  <step.icon size={16} color={step.textColor} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: step.textColor }}>{step.level}</Text>
                  <Text style={{ fontSize: fontSize.xs, color: step.textColor, marginTop: spacing.xs }}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {task.status !== "Completed" && (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {task.audience === "lc" && (
              <TouchableOpacity onPress={() => submitTaskProof(task.id)} style={{ backgroundColor: colors.success, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
                <Camera size={16} color={colors.white} strokeWidth={2} />
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Submit Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => markTaskDone(task.id)} style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
              <CheckCircle2 size={16} color={colors.white} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => revokeTask(task.id)} style={{ backgroundColor: colors.error, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
              <RotateCcw size={16} color={colors.white} strokeWidth={2} />
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Revoke</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
