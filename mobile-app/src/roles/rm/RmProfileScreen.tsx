import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Mail, Phone, MapPin, Briefcase, Shield, Award, Star, Clock, Building, Users, ChevronRight, Smartphone, CalendarDays, FileText, LogOut } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { QuickButton } from "../../shared/components/QuickButton";
import { EditProfileModal } from "../../modals/forms/EditProfileModal";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

export function RmProfileScreen() {
  const { currentUser, branches, openAuditTrail, logout } = useApp();
  const [editVisible, setEditVisible] = useState(false);
  if (!currentUser) return null;
  const initials = (currentUser.name || "").split(" ").map((n: any) => n?.[0] || "").join("").slice(0, 2).toUpperCase();
  const skills = Array.isArray(currentUser.skills) ? currentUser.skills : [];

  const detailRows = [
    { label: "Phone", value: currentUser.phone, icon: Phone },
    { label: "Email", value: currentUser.email, icon: Mail },
    { label: "Device ID", value: currentUser.deviceId, icon: Smartphone },
    { label: "Shift", value: currentUser.shift, icon: Clock },
    { label: "Join date", value: currentUser.joinDate, icon: CalendarDays },
    { label: "Emergency", value: currentUser.emergencyContact, icon: Shield },
  ];

  return (
    <ScreenWrapper>
      <SectionHeader title="Profile & Authority" action={<QuickButton label="Edit" onPress={() => setEditVisible(true)} />} />

      <Card variant="soft" style={{ backgroundColor: colors.text, marginTop: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xl }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: fontSize["4xl"], fontWeight: "400", color: colors.white }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize["3xl"], fontWeight: "400", color: colors.white }}>{currentUser.name}</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.slate300, marginTop: spacing.xs }}>Regional Manager (Super Admin)</Text>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
              <Badge label="RM" type="Critical" />
              <Badge label="Super Admin" type="High" />
            </View>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.xl }}>
        <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Award size={18} color={colors.brand} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{currentUser.rating}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Rating</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Building size={18} color={colors.brandSecondary} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{branches.length}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Branches</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Star size={18} color={colors.warning} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{currentUser.tasksClosed}</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Tasks closed</Text>
        </View>
        <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
          <Clock size={18} color={colors.success} strokeWidth={2} />
          <Text style={{ fontSize: fontSize.xl, fontWeight: "400", color: colors.text, marginTop: spacing.sm }}>{currentUser.attendancePct}%</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Attendance</Text>
        </View>
      </View>

      <Card variant="glass" style={{ marginTop: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
            <Phone size={16} color={colors.brand} strokeWidth={2} />
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

      <Card variant="glass" style={{ marginTop: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
            <Award size={16} color={colors.brand} strokeWidth={2} />
          </View>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Skills & Expertise</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {skills.map((skill, i) => (
            <View key={i} style={{ backgroundColor: colors.brandLight, borderRadius: borderRadius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.brand }}>{skill}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card variant="glass" style={{ marginTop: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
            <Shield size={16} color={colors.brand} strokeWidth={2} />
          </View>
          <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Regional Authority</Text>
        </View>
        <View style={{ gap: spacing.md }}>
          {[
            { icon: Building, color: colors.brand, title: "Branch oversight", desc: "Full access to all branches data and operations" },
            { icon: Shield, color: colors.success, title: "Approval authority", desc: "Can approve/reject requests up to 50,000" },
            { icon: Award, color: colors.warning, title: "Escalation handler", desc: "Final escalation point for complaints and alerts" },
            { icon: Users, color: colors.brandSecondary, title: "User management", desc: "Create, edit and manage all regional users" },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, backgroundColor: colors.slate50, borderRadius: borderRadius.lg, padding: spacing.xl }}>
              <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: item.color + "15", alignItems: "center", justifyContent: "center" }}>
                <item.icon size={18} color={item.color} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{item.title}</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <TouchableOpacity onPress={openAuditTrail} style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.xl, marginTop: spacing.xl }}>
        <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
          <FileText size={16} color={colors.brand} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>Open audit trail</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>Review all actions across your region</Text>
        </View>
        <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, borderWidth: 1, borderColor: "rgba(239,68,68,0.12)", flexDirection: "row", alignItems: "center", gap: spacing.xl, marginTop: spacing.md }}>
        <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: "rgba(239,68,68,0.08)", alignItems: "center", justifyContent: "center" }}>
          <LogOut size={16} color={colors.error} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: "800", color: colors.error }}>Sign Out</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.slate400, marginTop: spacing.xs }}>Log out of this corporate device console</Text>
        </View>
        <ChevronRight size={16} color={colors.slate400} strokeWidth={2} />
      </TouchableOpacity>

      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
    </ScreenWrapper>
  );
}
