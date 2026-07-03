import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontSize, spacing, borderRadius, shadows } from "../../theme/theme";

interface Props {
  label: string;
  value: string;
  meta: string;
  accent?: string;
  icon?: LucideIcon;
  onPress?: () => void;
}

function getGradientColors(): [string, string] {
  return ["#FFFFFF", "#ECF4FA"];
}

export function StatCard({ label, value, meta, accent, icon: Icon, onPress }: Props) {
  const finalAccent = accent || colors.brand;
  const gradientColors = getGradientColors();
  
  // Custom transparent border to match the accent
  const borderColor = finalAccent.startsWith("#") && finalAccent.length === 7 
    ? finalAccent + "1A" // ~10% opacity
    : colors.border;

  // Custom transparent background for the icon
  const iconBg = finalAccent.startsWith("#") && finalAccent.length === 7 
    ? finalAccent + "15" // ~8% opacity
    : "rgba(0, 91, 172, 0.08)";

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: borderColor,
        ...shadows.card
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text 
          numberOfLines={1} 
          style={{ 
            fontSize: 10, 
            fontWeight: "700", 
            color: colors.slate500, 
            textTransform: "uppercase", 
            letterSpacing: 1.2,
            flex: 1,
            marginRight: spacing.sm
          }}
        >
          {label}
        </Text>
        
        {Icon ? (
          <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color={finalAccent} strokeWidth={2.5} />
          </View>
        ) : null}
      </View>

      <Text 
        numberOfLines={1} 
        style={{ 
          fontSize: 22, 
          fontWeight: "800", 
          color: colors.slate900, 
          letterSpacing: -0.5, 
          marginTop: 6
        }}
      >
        {value}
      </Text>

      <Text 
        numberOfLines={1} 
        style={{ 
          fontSize: 11, 
          color: colors.slate500, 
          marginTop: 2 
        }}
      >
        {meta}
      </Text>
    </LinearGradient>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

