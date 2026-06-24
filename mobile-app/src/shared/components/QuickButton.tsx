import React, { useRef } from "react";
import { Text, TouchableOpacity, View, Animated } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "warning";

interface Props {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  variant?: ButtonVariant;
  /** @deprecated Use variant instead */
  tone?: string;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.slate900, text: colors.white },
  secondary: { bg: colors.white, text: colors.slate700, border: colors.border },
  success: { bg: colors.success, text: colors.white },
  danger: { bg: colors.error, text: colors.white },
  warning: { bg: colors.warning, text: colors.white },
};

function resolveVariant(variant: ButtonVariant | undefined, tone: string | undefined): ButtonVariant {
  if (variant) return variant;
  if (tone === "dark") return "primary";
  if (tone === "light") return "secondary";
  return "primary";
}

export function QuickButton({ label, icon: Icon, onPress, variant, tone, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const resolvedVariant = resolveVariant(variant, tone);
  const styles = variantStyles[resolvedVariant];

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.985, friction: 10, tension: 320, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, friction: 12, tension: 260, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        disabled={disabled}
        style={{
          borderRadius: 14,
          paddingHorizontal: spacing.xl,
          height: 44,
          backgroundColor: styles.bg,
          borderWidth: styles.border ? 1 : 0,
          borderColor: styles.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          minWidth: 100,
        }}
      >
        {Icon && <Icon size={18} color={styles.text} strokeWidth={2.2} />}
        <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: styles.text }}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
