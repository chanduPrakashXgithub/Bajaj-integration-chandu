import React from "react";
import { View } from "react-native";

interface Props {
  value: number;
  color: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 10 }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height, backgroundColor: "rgba(0,91,172,0.08)", borderRadius: 999, overflow: "hidden" }}>
      <View style={{ height: "100%", width: `${clamped}%`, backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}
