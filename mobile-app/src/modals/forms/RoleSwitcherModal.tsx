import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { UserCog, Briefcase, Crown, Check } from "lucide-react-native";
import { useApp } from "../../context/AppContext";
import { ROLES } from "../../data/mockData";
import { RoleId } from "../../types/domain";
import { ModalSheet } from "../../shared/components/ModalSheet";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const roleIconMap: Record<string, React.ComponentType<any>> = {
  lc: UserCog,
  branchManager: Briefcase,
  rm: Crown,
};

const roleAccentMap: Record<string, string> = {
  lc: colors.success,
  branchManager: colors.brandDeep,
  rm: colors.brand,
};

export function RoleSwitcherModal({ visible, onClose }: Props) {
  const { state, switchRole } = useApp();

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Switch Role">
      <ScrollView style={{ maxHeight: 400 }}>
        {(Object.values(ROLES) as any[]).map((r: any) => {
          const active = state.role === r.id;
          const Icon = roleIconMap[r.id];
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => { switchRole(r.id as RoleId); onClose(); }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.lg,
                padding: spacing.lg,
                borderRadius: borderRadius["2xl"],
                marginBottom: spacing.sm,
                backgroundColor: active ? colors.brandLight : "transparent",
                borderWidth: active ? 1 : 0,
                borderColor: active ? colors.brand : "transparent",
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: borderRadius["2xl"], backgroundColor: roleAccentMap[r.id], alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={colors.white} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>{r.name}</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{r.short}</Text>
              </View>
              {active ? (
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                  <Check size={14} color={colors.white} strokeWidth={3} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ModalSheet>
  );
}
