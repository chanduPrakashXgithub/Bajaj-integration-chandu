import React from "react";
import { View, Text } from "react-native";
import { toneClass } from "../../theme/styleMaps";

interface Props {
  label: string;
  type?: string;
}

export function Badge({ label, type }: Props) {
  const t = toneClass(type || label);
  return (
    <View style={{ backgroundColor: t.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: t.border }}>
      <Text style={{ color: t.text, fontSize: 11, fontWeight: "600", letterSpacing: 0.3 }}>{label}</Text>
    </View>
  );
}
