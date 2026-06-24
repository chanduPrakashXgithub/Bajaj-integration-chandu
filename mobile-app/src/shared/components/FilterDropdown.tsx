import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { ChevronDown, X } from "lucide-react-native";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

interface Option {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  style?: any;
}

export function FilterDropdown({ value, options, onChange, placeholder = "Filter", style }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={[{ flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.xs }, style]}
      >
        <Text style={{ fontSize: fontSize.sm, color: value ? colors.slate900 : colors.slate400 }}>
          {selected?.label || placeholder}
        </Text>
        <ChevronDown size={14} color={colors.slate400} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: spacing.xl }} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <View style={{ width: "100%", maxWidth: 280, backgroundColor: colors.white, borderRadius: borderRadius["2xl"], padding: spacing.lg, gap: spacing.xs }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginBottom: spacing.xs }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.slate900 }}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={{ padding: 4 }}>
                <X size={18} color={colors.slate500} />
              </TouchableOpacity>
            </View>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => { onChange(option.value); setIsOpen(false); }}
                  style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.brand + "10" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: fontSize.sm, color: isSelected ? colors.brand : colors.slate700, fontWeight: isSelected ? "600" : "400" }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
