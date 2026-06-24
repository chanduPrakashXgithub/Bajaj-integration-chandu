import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Task } from "../../types/domain";
import { useApp } from "../../context/AppContext";
import { colors, spacing, shadows } from "../../theme/theme";
import { progressColor } from "../../theme/styleMaps";
import { countdown } from "../../utils/helpers";
import { Badge } from "./Badge";

interface Props {
  task: Task;
  compact?: boolean;
  actions?: { label: string; onPress: () => void; primary?: boolean }[];
}

export function TaskCard({ task, compact = false, actions }: Props) {
  const { getBranch, openTaskDetail, state } = useApp();
  const branch = getBranch(task.branchId);
  const pct = task.checklistTotal > 0 ? (task.checklistDone / task.checklistTotal) * 100 : 0;

  return (
    <View 
      style={{ 
        backgroundColor: colors.white, 
        borderRadius: 16, 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md, 
        borderWidth: 1, 
        borderColor: colors.border, 
        marginBottom: spacing.md, 
        ...shadows.card 
      }}
    >
      {/* Top Section: Badges and Status */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
        <View style={{ flexDirection: "row", gap: spacing.xs, alignItems: "center" }}>
          <Badge label={task.status} type={task.status} />
          <Badge label={task.priority} type={task.priority} />
        </View>
        
        {/* Compact Deadline */}
        <Text style={{ fontSize: 11, fontWeight: "600", color: colors.brand }}>
          {countdown(task.deadline, state.now)}
        </Text>
      </View>

      {/* Title & Branch Subtitle */}
      <View style={{ marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.slate900 }} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "500", color: colors.slate500, marginTop: 2 }}>
          {branch?.name} • {task.zone}
        </Text>
        {task.notes && !compact ? (
          <Text style={{ fontSize: 12, color: colors.slate600, marginTop: 4 }} numberOfLines={2}>
            {task.notes}
          </Text>
        ) : null}
      </View>

      {/* Progress & Actions Row (Very Compact) */}
      <View 
        style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginTop: spacing.xs, 
          borderTopWidth: 1, 
          borderTopColor: colors.slate100, 
          paddingTop: spacing.sm 
        }}
      >
        {/* Checklist Progress */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1, marginRight: spacing.lg }}>
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.slate600 }}>
            {task.checklistDone}/{task.checklistTotal} Items
          </Text>
          <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.slate100, overflow: "hidden" }}>
            <View style={{ width: `${pct}%`, height: "100%", backgroundColor: progressColor(task.status), borderRadius: 3 }} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: spacing.xs }}>
          <TouchableOpacity
            onPress={() => openTaskDetail(task.id)}
            style={{ 
              borderRadius: 8, 
              paddingHorizontal: spacing.sm, 
              paddingVertical: 6, 
              backgroundColor: colors.white, 
              borderWidth: 1, 
              borderColor: colors.border,
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.slate700 }}>Open detail</Text>
          </TouchableOpacity>
          
          {actions?.map((a, i) => (
            <TouchableOpacity
              key={i}
              onPress={a.onPress}
              style={{ 
                borderRadius: 8, 
                paddingHorizontal: spacing.sm, 
                paddingVertical: 6, 
                backgroundColor: a.primary ? colors.success : colors.slate900,
                alignItems: "center", 
                justifyContent: "center"
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.white }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Redo Note (If any) */}
      {task.redoReason && !compact ? (
        <View style={{ marginTop: spacing.sm, backgroundColor: colors.red50, borderRadius: 8, padding: spacing.sm }}>
          <Text style={{ fontSize: 11, color: colors.red700 }}>
            <Text style={{ fontWeight: "600" }}>Redo:</Text> {task.redoReason}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
