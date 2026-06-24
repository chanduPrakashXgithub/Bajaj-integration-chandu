import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, fontSize, spacing } from "../../theme/theme";

interface SectionAction {
  label: string;
  onPress: () => void;
}

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode | SectionAction;
}

export function SectionHeader({ title, subtitle, action }: Props) {
  const isLinkAction = action && typeof action === "object" && "label" in action && "onPress" in action;

  return (
    <View style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: colors.slate900, letterSpacing: -0.3 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: fontSize.sm, color: colors.slate500, marginTop: 2, marginBottom: spacing.md }}>{subtitle}</Text>
      )}
      {isLinkAction ? (
        <TouchableOpacity
          onPress={(action as SectionAction).onPress}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.slate400 }}>
            {(action as SectionAction).label}
          </Text>
          <ChevronRight size={16} color={colors.slate400} strokeWidth={2} />
        </TouchableOpacity>
      ) : action ? (
        <View>{action}</View>
      ) : null}
    </View>
  );
}
