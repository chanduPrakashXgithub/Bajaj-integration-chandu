import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

interface TabItem {
  label: string;
  value: string;
}

interface Props {
  tabs: TabItem[];
  activeKey: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ tabs, activeKey, onChange }: Props) {
  return (
    <View style={{ borderRadius: 999, backgroundColor: "rgba(255,255,255,0.8)", padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => onChange(tab.value)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: activeKey === tab.value ? colors.slate900 : "transparent",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: "600",
                  color: activeKey === tab.value ? colors.white : colors.slate500,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
