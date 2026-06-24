import React from "react";
import { View, Text } from "react-native";
import { ScreenWrapper } from "../shared/layout/ScreenWrapper";
import { colors, fontSize, spacing } from "../theme/theme";
import { useApp } from "../context/AppContext";
import { ROLES } from "../data/mockData";

export function PlaceholderScreen() {
  const { state } = useApp();
  const role = ROLES[state.role];
  const page = role.pages.find((p) => p.id === state.page);
  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 20, color: colors.textSecondary }}>{"?"}</Text>
        </View>
        <Text style={{ fontSize: fontSize.xl, color: colors.textSecondary, marginTop: spacing.lg }}>
          {role.name} — {page?.label || state.page}
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.md }}>
          Coming in the next phase
        </Text>
      </View>
    </ScreenWrapper>
  );
}
