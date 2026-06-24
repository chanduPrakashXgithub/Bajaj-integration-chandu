import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Route, Calendar, Clock, CheckCircle, MapPin, Send, Eye, Search } from "lucide-react-native";
import { ScreenWrapper } from "../../shared/layout/ScreenWrapper";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Badge } from "../../shared/components/Badge";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

export function BranchManagerVisitsScreen() {
  const { scopedBranchIds, visits, getBranch, submitVisitReport, openVisitDetail } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("2026-04-20");
  const [toDate, setToDate] = useState("2026-04-26");

  const scopedVisits = visits.filter((v) => scopedBranchIds.map(String).includes(String(v.branchId)));
  
  const filteredVisits = scopedVisits.filter(v => 
    v.agenda.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingVisits = scopedVisits.filter((v) => v.status === "Scheduled");
  const overdueVisits = scopedVisits.filter((v) => v.status === "Escalated");
  const completedThisMonth = scopedVisits.filter((v) => v.status === "Completed");

  return (
    <ScreenWrapper>
      <SectionHeader title="Visit Management" />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl }}>
        <View style={{ flex: 2, minWidth: 200, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search visits..." 
            placeholderTextColor={colors.slate400}
            style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }} 
          />
        </View>
        <View style={{ flex: 1, minWidth: 140, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Calendar size={16} color={colors.slate400} />
          <TextInput value={fromDate} onChangeText={setFromDate} placeholder="From" style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }} />
        </View>
        <View style={{ flex: 1, minWidth: 140, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Calendar size={16} color={colors.slate400} />
          <TextInput value={toDate} onChangeText={setToDate} placeholder="To" style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, color: colors.slate900, fontSize: fontSize.sm }} />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Card variant="glass">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.brand + "15", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color={colors.brand} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text }}>Visit Schedule</Text>
          </View>
          <View style={{ gap: spacing.xl }}>
            {filteredVisits.length > 0 ? filteredVisits.map((visit) => {
              const branch = getBranch(visit.branchId);
              return (
                <View key={visit.id} style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" }}>
                        <Badge label={visit.status} type={visit.status} />
                        <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.textSecondary, textTransform: "uppercase" }}>{visit.purpose}</Text>
                      </View>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: "400", color: colors.text, marginTop: spacing.lg }}>{visit.agenda}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.lg }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                          <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
                          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{branch?.name || "Branch " + visit.branchId}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                          <Calendar size={14} color={colors.textSecondary} strokeWidth={2} />
                          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{visit.scheduledAt}</Text>
                        </View>
                      </View>
                      {visit.status === "Completed" && visit.report !== "Pending" ? (
                        <View style={{ marginTop: spacing.lg, backgroundColor: colors.emerald50, borderRadius: borderRadius.lg, padding: spacing.lg, flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
                          <CheckCircle size={14} color={colors.emerald700} strokeWidth={2} style={{ marginTop: 2 }} />
                          <Text style={{ fontSize: fontSize.sm, color: colors.emerald700, flex: 1 }}>{visit.report}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  {visit.status === "Scheduled" || visit.status === "Escalated" ? (
                    <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl }}>
                      <TouchableOpacity
                        onPress={() => openVisitDetail(visit.id)}
                        style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}
                      >
                        <Eye size={14} color={colors.white} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Detail</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => submitVisitReport(visit.id)}
                        style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border }}
                      >
                        <Send size={14} color={colors.text} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }}>Submit Report</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", marginTop: spacing.xl }}>
                      <TouchableOpacity
                        onPress={() => openVisitDetail(visit.id)}
                        style={{ backgroundColor: colors.brand, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }}
                      >
                        <Eye size={14} color={colors.white} strokeWidth={2} />
                        <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.white }}>Detail</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }) : (
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", padding: spacing["4xl"] }}>No visits scheduled</Text>
            )}
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
