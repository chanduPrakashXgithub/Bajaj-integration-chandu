import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Search, X, ChevronRight } from "lucide-react-native";
import { useApp } from "../../context/AppContext";
import { colors, fontSize, spacing, borderRadius, bodyFont } from "../../theme/theme";
import { Badge } from "../../shared/components/Badge";
import { ModalSheet } from "../../shared/components/ModalSheet";
import { Task, Complaint, Branch, User as UserType, Approval, Visit, NotificationItem } from "../../types/domain";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectResult: (entityType: string, entityId: string) => void;
}

export function SearchModal({ visible, onClose, onSelectResult }: Props) {
  const { tasks, complaints, users, branches, approvals, visits, getBranch } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      setQuery("");
    }
  }, [visible]);

  const q = query.toLowerCase().trim();

  const tasksFiltered = q.length > 0 ? tasks.filter(t => t.title.toLowerCase().includes(q) || (getBranch(t.branchId)?.name || "").toLowerCase().includes(q)) : [];
  const complaintsFiltered = q.length > 0 ? complaints.filter(c => (c.complaintId || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q) || (c.vendorId || "").toLowerCase().includes(q)) : [];
  const usersFiltered = q.length > 0 ? users.filter(u => u.name.toLowerCase().includes(q) || u.position.toLowerCase().includes(q) || u.role.includes(q)) : [];
  const branchesFiltered = q.length > 0 ? branches.filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)) : [];
  const approvalsFiltered = q.length > 0 ? approvals.filter(a => a.title.toLowerCase().includes(q) || a.note.toLowerCase().includes(q)) : [];
  const visitsFiltered = q.length > 0 ? visits.filter(v => v.purpose.toLowerCase().includes(q) || v.agenda.toLowerCase().includes(q)) : [];

  const results = { tasks: tasksFiltered, complaints: complaintsFiltered, users: usersFiltered, branches: branchesFiltered, approvals: approvalsFiltered, visits: visitsFiltered };
  const total = tasksFiltered.length + complaintsFiltered.length + usersFiltered.length + branchesFiltered.length + approvalsFiltered.length + visitsFiltered.length;

  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, backgroundColor: colors.slate50, borderRadius: borderRadius.md, paddingHorizontal: 14, paddingVertical: 12 }}>
        <Search size={16} color={colors.textSecondary} strokeWidth={1.8} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search checks, complaints, people, branches..."
          placeholderTextColor={colors.textSecondary}
          style={{ flex: 1, fontSize: fontSize.md, color: colors.text, fontFamily: bodyFont }}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery("")} style={{ padding: spacing.xs }}>
            <X size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {q.length > 0 ? (
        <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ padding: spacing.sm }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>{total} results</Text>
          {renderGroup("Checks", results.tasks, "task", colors.brand, onSelectResult, onClose, id => {
            const t = tasks.find(t => t.id === id);
            return t ? { title: t.title, subtitle: getBranch(t.branchId)?.name + " | " + t.status, badge: t.priority } : undefined;
          })}
          {renderGroup("Complaints", results.complaints, "complaint", colors.error, onSelectResult, onClose, id => {
            const c = complaints.find(c => c.id === id);
            return c ? { title: c.complaintId, subtitle: c.vendorId + " | " + c.status, badge: c.priority } : undefined;
          })}
          {renderGroup("People", results.users, "user", colors.brandSecondary, onSelectResult, onClose, id => {
            const u = users.find(u => u.id === id);
            return u ? { title: u.name, subtitle: u.position + " — " + (getBranch(u.branchId)?.name || ""), badge: u.role } : undefined;
          })}
          {renderGroup("Branches", results.branches, "branch", colors.success, onSelectResult, onClose, id => {
            const b = branches.find(b => b.id === id);
            return b ? { title: b.name, subtitle: b.code + " | " + b.city, badge: b.health + "%" } : undefined;
          })}
          {renderGroup("Approvals", results.approvals, "approval", colors.warning, onSelectResult, onClose, id => {
            const a = approvals.find(a => a.id === id);
            return a ? { title: a.title, subtitle: a.kind + " | " + a.stage, badge: a.status } : undefined;
          })}
          {renderGroup("Visits", results.visits, "visit", colors.info, onSelectResult, onClose, id => {
            const v = visits.find(v => v.id === id);
            return v ? { title: v.purpose, subtitle: (getBranch(v.branchId)?.name || "") + " | " + v.scheduledAt, badge: v.status } : undefined;
          })}
        </ScrollView>
      ) : null}
    </ModalSheet>
  );
}

interface ResultItem {
  title: string;
  subtitle: string;
  badge: string;
}

function renderGroup(
  label: string,
  items: any[],
  entityType: string,
  accentColor: string,
  onSelect: (entityType: string, entityId: string) => void,
  onClose: () => void,
  getItem: (id: string) => ResultItem | undefined,
) {
  if (items.length === 0) return null;
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor }} />
        <Text style={{ fontSize: fontSize.xs, fontWeight: "400", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>{label} ({items.length})</Text>
      </View>
      {items.slice(0, 5).map((item: any) => {
        const data = getItem(item.id);
        if (!data) return null;
        return (
          <TouchableOpacity
            key={entityType + "-" + item.id}
            onPress={() => { onSelect(entityType, item.id); onClose(); }}
            style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderRadius: borderRadius["2xl"], gap: spacing.sm }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "400", color: colors.text }} numberOfLines={1}>{data.title}</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }} numberOfLines={1}>{data.subtitle}</Text>
            </View>
            <Badge label={data.badge} type={data.badge} />
            <ChevronRight size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
