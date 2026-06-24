import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { Sliders, Bell, MapPin, Clock, Shield, Globe, Database, RefreshCw, ChevronRight, Check, X } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { Card } from "../../shared/components/Card";
import { useApp, AppSettings } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

export function RmSettingsScreen() {
  const { settings, saveSettings, showToast } = useApp();
  const [editSection, setEditSection] = useState<string | null>(null);
  const [draft, setDraft] = useState<AppSettings>({ ...settings });

  const startEdit = (section: string) => {
    setDraft({ ...settings });
    setEditSection(section);
  };

  const cancelEdit = () => {
    setEditSection(null);
    setDraft({ ...settings });
  };

  const saveSection = (section: string) => {
    saveSettings(draft);
    setEditSection(null);
  };

  const updateDraft = (key: keyof AppSettings, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const sections = [
    {
      id: "alert",
      title: "Alert Configuration",
      icon: Bell,
      iconColor: colors.brand,
      items: [
        { key: "criticalAlertRule" as keyof AppSettings, label: "Critical alert rule", type: "text" },
        { key: "deadlineRule" as keyof AppSettings, label: "Deadline rule", type: "text" },
        { key: "escalationTimeout" as keyof AppSettings, label: "Escalation timeout", type: "text" },
      ],
    },
    {
      id: "geo",
      title: "Geo-fence Settings",
      icon: MapPin,
      iconColor: colors.brandSecondary,
      items: [
        { key: "geoRadius" as keyof AppSettings, label: "Default geo-radius (meters)", type: "number" },
        { key: "locationProofRequired" as keyof AppSettings, label: "Location proof required", type: "toggle" },
        { key: "selfieVerification" as keyof AppSettings, label: "Selfie verification", type: "toggle" },
      ],
    },
    {
      id: "shift",
      title: "Shift & Scheduling",
      icon: Clock,
      iconColor: colors.warning,
      items: [
        { key: "workerShiftWindow" as keyof AppSettings, label: "Worker shift window", type: "text" },
        { key: "weekendSchedule" as keyof AppSettings, label: "Weekend schedule", type: "text" },
      ],
    },
    {
      id: "policy",
      title: "Regional Policies",
      icon: Shield,
      iconColor: colors.success,
      items: [
        { key: "budgetApprovalLimitBM" as keyof AppSettings, label: "BM approval limit", type: "number" },
        { key: "budgetApprovalLimitRM" as keyof AppSettings, label: "RM approval limit", type: "number" },
        { key: "proofPolicy" as keyof AppSettings, label: "Proof policy", type: "text" },
        { key: "auditFrequency" as keyof AppSettings, label: "Audit frequency", type: "text" },
      ],
    },
    {
      id: "data",
      title: "Data & Sync",
      icon: Database,
      iconColor: colors.slate600,
      items: [
        { key: "autoSyncInterval" as keyof AppSettings, label: "Auto sync interval", type: "text" },
        { key: "offlineMode" as keyof AppSettings, label: "Offline mode", type: "toggle" },
        { key: "dataRetentionDays" as keyof AppSettings, label: "Data retention (days)", type: "number" },
      ],
    },
  ];

  const formatValue = (key: keyof AppSettings, value: any, type: string) => {
    if (type === "toggle") return value ? "Enabled" : "Disabled";
    if (type === "number" && key.toString().includes("budget")) return `₹${Number(value).toLocaleString()}`;
    if (type === "number" && key === "geoRadius") return `${value} meters`;
    if (type === "number" && key === "dataRetentionDays") return `${value} days`;
    return String(value);
  };

  return (
    <ScreenWrapper>
      <SectionHeader title="Settings" />

      <View style={{ gap: spacing.xl, marginTop: spacing.xl }}>
        {sections.map((section) => {
          const isEditing = editSection === section.id;
          return (
            <Card variant="glass" key={section.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
                <View style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: section.iconColor + "15", alignItems: "center", justifyContent: "center" }}>
                  <section.icon size={18} color={section.iconColor} strokeWidth={2} />
                </View>
                <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, flex: 1 }}>{section.title}</Text>
                {isEditing ? (
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <TouchableOpacity onPress={() => saveSection(section.id)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" }}>
                      <Check size={16} color={colors.white} strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={cancelEdit} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.error, alignItems: "center", justifyContent: "center" }}>
                      <X size={16} color={colors.white} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => startEdit(section.id)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                    <Sliders size={14} color={colors.white} strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ gap: spacing.sm }}>
                {section.items.map((item) => (
                  <View key={item.key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.slate50, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md }}>
                    <View style={{ flex: 1, marginRight: spacing.md }}>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{item.label}</Text>
                      {isEditing ? (
                        item.type === "toggle" ? (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
                            <Switch
                              value={draft[item.key] as boolean}
                              onValueChange={(v) => updateDraft(item.key, v)}
                              trackColor={{ false: colors.slate200, true: colors.brand + "60" }}
                              thumbColor={draft[item.key] ? colors.brand : colors.slate400}
                            />
                            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{draft[item.key] ? "Enabled" : "Disabled"}</Text>
                          </View>
                        ) : (
                          <TextInput
                            value={String(draft[item.key])}
                            onChangeText={(v) => updateDraft(item.key, item.type === "number" ? Number(v) || 0 : v)}
                            keyboardType={item.type === "number" ? "numeric" : "default"}
                            style={{ fontSize: fontSize.xs, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.brand, paddingVertical: spacing.xs, marginTop: spacing.xs }}
                          />
                        )
                      ) : (
                        <Text numberOfLines={1} style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs }}>{formatValue(item.key, settings[item.key], item.type)}</Text>
                      )}
                    </View>
                    {!isEditing && (
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: section.iconColor + "15", alignItems: "center", justifyContent: "center" }}>
                        <ChevronRight size={14} color={section.iconColor} strokeWidth={2} />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}
