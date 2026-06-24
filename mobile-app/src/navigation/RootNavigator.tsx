import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, ListChecks, Wrench, MapPin, Bell, IdCard, BarChart3, AlertCircle, Building, LineChart, Stamp, Route, Satellite, TriangleAlert, Wallet, ChartColumn, Users, Sliders, Circle } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { ROLES } from "../data/mockData";
import { colors, fontSize } from "../theme/theme";
import { pageIcon, roleAccent } from "../theme/styleMaps";
import { TopBar } from "../shared/layout/TopBar";
import { ResponsiveShell } from "../shared/layout/ResponsiveShell";
import { Toast } from "../shared/components/Toast";
import { FormModal } from "../modals/forms/FormModal";
import { AuditTrailModal } from "../modals/forms/AuditTrailModal";
import { DetailModal } from "../modals/detail/DetailModal";
import { SearchModal } from "../modals/forms/SearchModal";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { LoginScreen } from "./LoginScreen";
import { RmResolveComplaintModal } from "../modals/forms/RmResolveComplaintModal";

import { LcHomeScreen } from "../roles/lc/LcHomeScreen";
import { LcTasksScreen } from "../roles/lc/LcTasksScreen";
import { LcComplaintsScreen } from "../roles/lc/LcComplaintsScreen";
import { LcBranchScreen } from "../roles/lc/LcBranchScreen";
import { LcAttendanceScreen } from "../roles/lc/LcAttendanceScreen";
import { LcNotificationsScreen } from "../roles/lc/LcNotificationsScreen";
import { LcProfileScreen } from "../roles/lc/LcProfileScreen";

import { BranchManagerHomeScreen } from "../roles/branchManager/BranchManagerHomeScreen";
import { BranchManagerBranchesScreen } from "../roles/branchManager/BranchManagerBranchesScreen";
import { BranchManagerMonitoringScreen } from "../roles/branchManager/BranchManagerMonitoringScreen";
import { BranchManagerComplaintsScreen } from "../roles/branchManager/BranchManagerComplaintsScreen";
import { BranchManagerApprovalsScreen } from "../roles/branchManager/BranchManagerApprovalsScreen";
import { BranchManagerVisitsScreen } from "../roles/branchManager/BranchManagerVisitsScreen";
import { BranchManagerNotificationsScreen } from "../roles/branchManager/BranchManagerNotificationsScreen";
import { BranchManagerProfileScreen } from "../roles/branchManager/BranchManagerProfileScreen";
import { BranchManagerAttendanceScreen } from "../roles/branchManager/BranchManagerAttendanceScreen";

import { RmDashboardScreen } from "../roles/rm/RmDashboardScreen";
import { RmIntelligenceScreen } from "../roles/rm/RmIntelligenceScreen";
import { RmAlertsScreen } from "../roles/rm/RmAlertsScreen";
import { RmAnalyticsScreen } from "../roles/rm/RmAnalyticsScreen";
import { RmApprovalsScreen } from "../roles/rm/RmApprovalsScreen";
import { UserManagementScreen } from "../roles/rm/UserManagementScreen";
import { RmSettingsScreen } from "../roles/rm/RmSettingsScreen";
import { RmNotificationsScreen } from "../roles/rm/RmNotificationsScreen";
import { RmProfileScreen } from "../roles/rm/RmProfileScreen";
import { RmAttendanceScreen } from "../roles/rm/RmAttendanceScreen";
import { RmFinanceScreen } from "../roles/rm/RmFinanceScreen";
import { RmMonitoringScreen } from "../roles/rm/RmMonitoringScreen";
import { RmComplaintCommandCenter } from "../roles/rm/RmComplaintCommandCenter";

const screenRegistry: Record<string, React.ComponentType> = {};

export function registerScreen(roleId: string, pageId: string, component: React.ComponentType) {
  screenRegistry[roleId + "_" + pageId] = component;
}

registerScreen("lc", "home", LcHomeScreen);
registerScreen("lc", "tasks", LcTasksScreen);
registerScreen("lc", "complaints", LcComplaintsScreen);
registerScreen("lc", "branch", LcBranchScreen);
registerScreen("lc", "attendance", LcAttendanceScreen);
registerScreen("lc", "notifications", LcNotificationsScreen);
registerScreen("lc", "profile", LcProfileScreen);

registerScreen("branchManager", "home", BranchManagerHomeScreen);
registerScreen("branchManager", "branches", BranchManagerBranchesScreen);
registerScreen("branchManager", "monitoring", BranchManagerMonitoringScreen);
registerScreen("branchManager", "complaints", BranchManagerComplaintsScreen);
registerScreen("branchManager", "approvals", BranchManagerApprovalsScreen);
registerScreen("branchManager", "visits", BranchManagerVisitsScreen);
registerScreen("branchManager", "attendance", BranchManagerAttendanceScreen);
registerScreen("branchManager", "notifications", BranchManagerNotificationsScreen);
registerScreen("branchManager", "profile", BranchManagerProfileScreen);

registerScreen("aa", "home", BranchManagerHomeScreen);
registerScreen("aa", "branches", BranchManagerBranchesScreen);
registerScreen("aa", "monitoring", BranchManagerMonitoringScreen);
registerScreen("aa", "complaints", BranchManagerComplaintsScreen);
registerScreen("aa", "approvals", BranchManagerApprovalsScreen);
registerScreen("aa", "visits", BranchManagerVisitsScreen);
registerScreen("aa", "attendance", BranchManagerAttendanceScreen);
registerScreen("aa", "notifications", BranchManagerNotificationsScreen);
registerScreen("aa", "profile", BranchManagerProfileScreen);

registerScreen("rm", "dashboard", RmDashboardScreen);
registerScreen("rm", "monitoring", RmMonitoringScreen);
registerScreen("rm", "intelligence", RmIntelligenceScreen);
registerScreen("rm", "alerts", RmAlertsScreen);
registerScreen("rm", "finance", RmFinanceScreen);
registerScreen("rm", "complaints", RmComplaintCommandCenter);
registerScreen("rm", "analytics", RmAnalyticsScreen);
registerScreen("rm", "approvals", RmApprovalsScreen);
registerScreen("rm", "users", UserManagementScreen);
registerScreen("rm", "settings", RmSettingsScreen);
registerScreen("rm", "attendance", RmAttendanceScreen);
registerScreen("rm", "notifications", RmNotificationsScreen);
registerScreen("rm", "profile", RmProfileScreen);

function getScreen(roleId: string, pageId: string): React.ComponentType {
  return screenRegistry[roleId + "_" + pageId] || PlaceholderScreen;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Home, ListChecks, Wrench, MapPin, Bell, IdCard,
  BarChart3, AlertCircle, Building, LineChart, Stamp,
  Route, Satellite, TriangleAlert, Wallet, ChartColumn,
  Users, Sliders, Circle,
};

function GlassTabBar({ pages }: { pages: Array<{ id: string; label: string }> }) {
  const { state, setPage } = useApp();
  const insets = useSafeAreaInsets();
  const accent = roleAccent(state.role).bg;
  const visibleRoutes = pages.slice(0, 5);

  const compactLabel = (label: string, pageId: string) => {
    const map: Record<string, string> = {
      complaints: "Issues",
      attendance: "Attend",
      notifications: "Alerts",
      monitoring: "Monitor",
      intelligence: "Intel",
      approvals: "Approve",
    };
    return map[pageId] || label;
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 14 + insets.bottom,
        left: 16,
        right: 16,
        alignItems: "center",
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 30,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(226,232,240,0.95)",
          backgroundColor: "rgba(255,255,255,0.96)",
          shadowColor: colors.slate900,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
          elevation: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            height: 66,
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 8,
            paddingVertical: 7,
          }}
        >
          {visibleRoutes.map((route) => {
            const isFocused = state.page === route.id;
            const iconName = pageIcon(route.id);
            const Icon = iconMap[iconName] || Circle;
            const label = compactLabel(route.label, route.id);

            return (
              <TouchableOpacity
                key={route.id}
                onPress={() => {
                  if (!isFocused) {
                    setPage(route.id);
                  }
                }}
                activeOpacity={0.7}
                style={{
                  flex: isFocused ? 1.25 : 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: 50,
                  paddingHorizontal: isFocused ? 10 : 6,
                  borderRadius: 24,
                  backgroundColor: isFocused ? "rgba(15,23,42,0.96)" : "transparent",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Icon
                      size={20}
                      color={isFocused ? colors.white : colors.slate500}
                      strokeWidth={isFocused ? 2.25 : 1.85}
                    />
                    {!isFocused ? (
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: "transparent",
                          marginTop: 3,
                        }}
                      />
                    ) : null}
                  </View>
                  {isFocused ? (
                    <View style={{ maxWidth: 74 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: colors.white,
                          letterSpacing: 0.1,
                        }}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                      <View
                        style={{
                          width: 18,
                          height: 3,
                          borderRadius: 99,
                          backgroundColor: accent,
                          marginTop: 4,
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function MainTabs({ isTablet }: { isTablet: boolean }) {
  const { state, setPage } = useApp();
  const roleDef = ROLES[state.role];
  const pages = roleDef.pages;
  const currentPage = pages.some((page) => page.id === state.page) ? state.page : pages[0]?.id;
  const Screen = getScreen(state.role, currentPage);

  useEffect(() => {
    if (currentPage && currentPage !== state.page) {
      setPage(currentPage);
    }
  }, [currentPage, state.page, setPage]);

  return (
    <View style={{ flex: 1 }}>
      <Screen />
      {!isTablet ? <GlassTabBar pages={pages} /> : null}
    </View>
  );
}

export function RootNavigator() {
  const { token, state, setPage, dispatch, logout } = useApp();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [resolveModal, setResolveModal] = useState<{ complaintId: string | number } | null>(null);
  const [detailModal, setDetailModal] = useState<{ entityType: string; entityId: string } | null>(null);

  useEffect(() => {
    const type = state.modalType;
    if (!type) return;
    if (type === "form") {
      setFormModalVisible(true);
      dispatch({ type: "CLOSE_MODAL" });
    } else if (type === "audit") {
      setAuditModalVisible(true);
      dispatch({ type: "CLOSE_MODAL" });
    } else if (type === "resolveComplaint") {
      setResolveModal({ complaintId: state.modalData?.id });
      dispatch({ type: "CLOSE_MODAL" });
    } else if (["task", "complaint", "branch", "user", "appliance", "approval", "visit"].includes(type)) {
      setDetailModal({ entityType: type, entityId: state.modalData?.id });
    }
  }, [state.modalType, state.modalData]);

  if (!token) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: isTablet ? "#EEF2F7" : colors.bg }}>
      <ResponsiveShell isTablet={isTablet}>
        <TopBar
          onLogoutPress={logout}
          onSearchPress={() => setSearchModalVisible(true)}
          onFormPress={() => setFormModalVisible(true)}
          onNotificationPress={() => setPage("notifications")}
          onProfilePress={() => setPage("profile")}
          onUsersPress={() => setPage("users")}
        />
        <MainTabs isTablet={isTablet} />
        <Toast />
        <FormModal visible={formModalVisible} onClose={() => setFormModalVisible(false)} />
        <AuditTrailModal visible={auditModalVisible} onClose={() => setAuditModalVisible(false)} />
          <SearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          onSelectResult={(entityType, entityId) => setDetailModal({ entityType, entityId })}
        />
        {resolveModal ? (
          <RmResolveComplaintModal
            visible={!!resolveModal}
            onClose={() => setResolveModal(null)}
            complaintId={resolveModal.complaintId}
          />
        ) : null}
        {detailModal ? (
          <DetailModal
            visible={!!detailModal}
            onClose={() => { setDetailModal(null); dispatch({ type: "CLOSE_MODAL" }); }}
            entityType={detailModal.entityType}
            entityId={detailModal.entityId}
          />
        ) : null}
      </ResponsiveShell>
    </View>
  );
}
