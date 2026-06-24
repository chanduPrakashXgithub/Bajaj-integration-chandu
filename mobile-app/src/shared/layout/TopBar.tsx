import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell, Plus, Building2, LogOut, Users } from "lucide-react-native";
import { useApp } from "../../context/AppContext";
import { ROLES } from "../../data/mockData";
import { colors, fontSize, spacing } from "../../theme/theme";

interface Props {
  onSearchPress?: () => void;
  onLogoutPress?: () => void;
  onFormPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onUsersPress?: () => void;
}

export function TopBar({ onSearchPress, onLogoutPress, onFormPress, onNotificationPress, onProfilePress, onUsersPress }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state, currentUser, notifications } = useApp();
  const role = ROLES[state.role];
  const page = role.pages.find((p) => p.id === state.page);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isCompact = width < 420;
  const showSearch = width >= 560;
  const showSwitchText = width >= 480;

  const initials = currentUser?.name
    ? currentUser.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "US";

  return (
    <View
      style={{
        backgroundColor: "rgba(245,247,250,0.92)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(226,232,240,0.55)",
        paddingTop: insets.top + 6,
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: isCompact ? spacing.lg : spacing.xl,
          minHeight: 50,
          gap: isCompact ? spacing.md : spacing.lg,
        }}
      >
        {/* Left: brand icon + role title */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flexShrink: 1 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: colors.slate900,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.slate900,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.14,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Building2 size={18} color={colors.white} strokeWidth={2.2} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text
              style={{
                fontSize: fontSize.xl,
                fontWeight: "800",
                color: colors.slate900,
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {page?.label || role.name}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: colors.slate500,
                letterSpacing: 0.7,
                textTransform: "uppercase",
              }}
              numberOfLines={1}
            >
              {isCompact ? role.short : `${role.name} · Bajaj Finserv`}
            </Text>
          </View>
        </View>

        {/* Center: search bar */}
        {showSearch ? (
          <TouchableOpacity
            onPress={onSearchPress}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.white,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(226,232,240,0.9)",
              paddingHorizontal: spacing.xl,
              height: 40,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <Search size={16} color={colors.slate400} />
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.slate400,
                marginLeft: spacing.sm,
                fontWeight: "500",
              }}
              numberOfLines={1}
            >
              Search checks, alerts, issues...
            </Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}

        {/* Right: notification + form + switch + avatar */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: isCompact ? spacing.sm : spacing.md }}>
          {!showSearch ? (
            <TouchableOpacity
              onPress={onSearchPress}
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.slate200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={17} color={colors.slate500} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
          {/* Users button (RM only) */}
          {state.role === "rm" ? (
            <TouchableOpacity
              onPress={onUsersPress}
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.slate200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={17} color={colors.slate500} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
          {/* Notification bell */}
          <TouchableOpacity
            onPress={onNotificationPress}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.slate200,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={17} color={colors.slate500} strokeWidth={2} />
            {unreadCount > 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.error,
                  borderWidth: 2,
                  borderColor: colors.white,
                }}
              />
            ) : null}
          </TouchableOpacity>

          {/* Quick create button */}
          <TouchableOpacity
            onPress={onFormPress}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: colors.brand,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.brand,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.22,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Plus size={19} color={colors.white} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={onLogoutPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs,
              width: showSwitchText ? undefined : 38,
              paddingHorizontal: showSwitchText ? spacing.md : 0,
              height: 38,
              borderRadius: 999,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.slate200,
            }}
          >
            <LogOut size={14} color={colors.error} />
            {showSwitchText ? (
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: colors.error,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                }}
              >
                Logout
              </Text>
            ) : null}
          </TouchableOpacity>

          {/* Avatar initials */}
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.brandDeep,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: colors.brandDeep,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize.sm,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                {initials}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
