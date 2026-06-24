import React, { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { colors, shadows, borderRadius } from "../../theme/theme";

interface Props {
  children: ReactNode;
  variant?: "glass" | "soft";
  style?: ViewStyle;
}

export function Card({ children, variant = "soft", style }: Props) {
  const isGlass = variant === "glass";
  const cardRadius = isGlass ? 28 : 24;

  const cardContent = (
    <View
      style={[
        {
          backgroundColor: isGlass ? "rgba(255,255,255,0.94)" : colors.card,
          borderRadius: cardRadius,
          borderWidth: 1,
          borderColor: isGlass ? "rgba(255,255,255,0.6)" : colors.border,
          padding: 20,
          overflow: "hidden",
          ...(isGlass ? shadows.shell : shadows.card),
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  return cardContent;
}
