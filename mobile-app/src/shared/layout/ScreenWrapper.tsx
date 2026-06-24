import React, { ReactNode } from "react";
import { View, ScrollView, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../../theme/theme";

interface Props {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ScreenWrapper({ children, scroll = true, contentContainerStyle }: Props) {
  const content = scroll
    ? (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scrollContent, contentContainerStyle]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    )
    : (
      <View style={{ flex: 1 }}>
        <View style={[styles.scrollContent, contentContainerStyle]}>
          {children}
        </View>
      </View>
    );

  return (
    <View style={styles.root}>
      {/* Background gradient layer */}
      <LinearGradient
        colors={["#E6F3FF", "#F4F8FC", "#EEF2F7"]}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Radial overlay (simulated with another gradient) */}
      <LinearGradient
        colors={["rgba(0,91,172,0.08)", "transparent"]}
        locations={[0, 0.3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
        pointerEvents="none"
      />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF2F7",
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
});
