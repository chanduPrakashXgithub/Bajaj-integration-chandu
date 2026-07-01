import React, { useEffect, useRef } from "react";
import {
  Animated,
  TouchableWithoutFeedback,
  View,
  Text,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, fontSize, bodyFont } from "../../theme/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ModalSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(72)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(72);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 18,
          tension: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, zIndex: 100 }}
      pointerEvents="box-none"
    >
      <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
          }}
        >
          <BlurView intensity={12} tint="dark" style={{ flex: 1 }} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "90%",
          backgroundColor: colors.card,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          transform: [{ translateY: slideAnim }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 16,
        }}
      >
        {/* Drag handle */}
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: colors.slate300,
            borderRadius: 2,
            alignSelf: "center",
            marginBottom: spacing.lg,
          }}
        />

        {/* Header */}
        {title ? (
          <Text
            style={{
              fontSize: fontSize.xl,
              fontFamily: bodyFont,
              fontWeight: "700",
              color: colors.text,
              marginBottom: subtitle ? spacing.xs : spacing.md,
            }}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            style={{
              fontSize: fontSize.sm,
              fontFamily: bodyFont,
              color: colors.textSecondary,
              marginBottom: spacing.md,
            }}
          >
            {subtitle}
          </Text>
        ) : null}

        {/* Content */}
        {children}
      </Animated.View>
      </Modal>
    </View>
  );
}
