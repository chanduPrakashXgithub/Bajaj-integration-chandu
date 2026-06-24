import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Calendar, X } from "lucide-react-native";
import { colors, fontSize, spacing, borderRadius } from "../../theme/theme";

function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, month: month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month, year, isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false });
  }

  return days;
}

interface DatePickerDropdownProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  style?: any;
}

export function DatePickerDropdown({ value, onChange, placeholder = "Select date", style }: DatePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen && value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentMonth(parsed);
      }
    } else if (isOpen) {
      setCurrentMonth(new Date());
    }
  }, [isOpen, value]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const days = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (item: { day: number; month: number; year: number }) => {
    const mm = String(item.month + 1).padStart(2, "0");
    const dd = String(item.day).padStart(2, "0");
    const dateStr = `${item.year}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={[{ flexDirection: "row", alignItems: "center", flex: 1 }, style]}
      >
        <Calendar size={16} color={colors.slate400} />
        <Text
          style={[
            { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, fontSize: fontSize.sm },
            value ? { color: colors.slate900 } : { color: colors.slate400 },
          ]}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: spacing.xl }}>
          <View style={{ width: "100%", maxWidth: 320, backgroundColor: colors.white, borderRadius: borderRadius["2xl"], padding: spacing.lg, gap: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.slate900 }}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={{ padding: 4 }}>
                <X size={18} color={colors.slate500} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: spacing.xs }}>
                <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.brand }}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.slate800 }}>
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: spacing.xs }}>
                <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.brand }}>{">"}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {daysOfWeek.map((day) => (
                <View key={day} style={{ width: "14.28%", alignItems: "center", paddingVertical: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "500", color: colors.slate400 }}>{day}</Text>
                </View>
              ))}
              {days.map((item, idx) => {
                const mm = String(item.month + 1).padStart(2, "0");
                const dd = String(item.day).padStart(2, "0");
                const cellDateStr = `${item.year}-${mm}-${dd}`;
                const isSelected = value === cellDateStr;

                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={!item.isCurrentMonth}
                    onPress={() => handleSelectDay(item)}
                    style={{
                      width: "14.28%",
                      aspectRatio: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      backgroundColor: isSelected ? colors.brand : "transparent",
                      opacity: item.isCurrentMonth ? 1 : 0.2,
                    }}
                  >
                    <Text style={{ fontSize: fontSize.xs, color: isSelected ? colors.white : colors.slate800, fontWeight: isSelected ? "600" : "400" }}>
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
              <TouchableOpacity onPress={handleClear} style={{ flex: 1, paddingVertical: 8, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.slate500, fontWeight: "600" }}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={{ flex: 1, paddingVertical: 8, borderRadius: borderRadius.md, backgroundColor: colors.slate100, alignItems: "center" }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.slate700, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
