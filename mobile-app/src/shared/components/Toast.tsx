import React, { useEffect, useRef } from "react";
import { Animated, Text, Platform } from "react-native";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, shadows } from "../../theme/theme";

export function Toast() {
  const { state } = useApp();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-6)).current;

  useEffect(() => {
    if (state.toast) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 110, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 90, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -6, duration: 90, useNativeDriver: true }),
      ]).start();
    }
  }, [state.toast]);

  if (!state.toast) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: Platform.OS === "ios" ? 54 : 44,
        right: 16,
        zIndex: 60,
        borderRadius: 16,
        backgroundColor: colors.text,
        paddingHorizontal: 16,
        paddingVertical: 12,
        opacity,
        transform: [{ translateY }],
        ...shadows.modal,
      }}
    >
      <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>{state.toast}</Text>
    </Animated.View>
  );
}
