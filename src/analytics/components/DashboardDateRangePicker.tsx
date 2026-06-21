import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Themed';
import { formatRangeLabel, getLastNDaysRange } from '@/src/analytics/dateRanges';
import type { DashboardDateRange } from '@/src/analytics/types';
import { useTheme } from '@/src/hooks/useTheme';

const DAY_PRESETS = [7, 14, 30, 60, 90];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DashboardDateRangePickerProps {
  days: number;
  onDaysChange: (days: number) => void;
  range: DashboardDateRange | null;
  onRangeChange: (range: DashboardDateRange | null) => void;
}

interface MonthCursor {
  year: number;
  month: number;
}

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function buildMonthCells(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
}

function addMonths(cursor: MonthCursor, offset: number): MonthCursor {
  const next = new Date(cursor.year, cursor.month + offset, 1);
  return {
    year: next.getFullYear(),
    month: next.getMonth(),
  };
}

function isWithinRange(date: Date, range: DashboardDateRange): boolean {
  const time = startOfDay(date).getTime();
  return time >= startOfDay(new Date(range.startMs)).getTime() &&
    time <= startOfDay(new Date(range.endMs)).getTime();
}

function formatButtonLabel(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

export function DashboardDateRangePicker({
  days,
  onDaysChange,
  range,
  onRangeChange,
}: DashboardDateRangePickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const activeRange = range ?? getLastNDaysRange(days);
  const [draftRange, setDraftRange] = useState<DashboardDateRange>(activeRange);
  const [awaitingEndDate, setAwaitingEndDate] = useState(false);
  const [cursor, setCursor] = useState<MonthCursor>(() => {
    const anchor = new Date(activeRange.startMs);
    return { year: anchor.getFullYear(), month: anchor.getMonth() };
  });

  const summary = useMemo(() => {
    return range ? formatRangeLabel(range) : `Last ${formatButtonLabel(days)}`;
  }, [days, range]);

  const openPicker = () => {
    const nextRange = range ?? getLastNDaysRange(days);
    setDraftRange(nextRange);
    setAwaitingEndDate(false);
    const anchor = new Date(nextRange.startMs);
    setCursor({ year: anchor.getFullYear(), month: anchor.getMonth() });
    setOpen(true);
  };

  const handleDayPress = (selected: Date) => {
    const selectedMs = startOfDay(selected).getTime();
    const start = startOfDay(new Date(draftRange.startMs));
    const end = startOfDay(new Date(draftRange.endMs));

    if (!awaitingEndDate) {
      setDraftRange({ startMs: selectedMs, endMs: selectedMs });
      setAwaitingEndDate(true);
      return;
    }

    if (selectedMs < start.getTime()) {
      setDraftRange({ startMs: selectedMs, endMs: start.getTime() });
      return;
    }

    setDraftRange({
      startMs: start.getTime(),
      endMs: selectedMs,
    });
    setAwaitingEndDate(false);
  };

  const handleApply = () => {
    onRangeChange({
      startMs: Math.min(draftRange.startMs, draftRange.endMs),
      endMs: Math.max(draftRange.startMs, draftRange.endMs),
    });
    setAwaitingEndDate(false);
    setOpen(false);
  };

  const handleClear = () => {
    onRangeChange(null);
    setAwaitingEndDate(false);
    setOpen(false);
  };

  const monthCells = buildMonthCells(cursor.year, cursor.month);
  const draftStart = startOfDay(new Date(draftRange.startMs));
  const draftEnd = startOfDay(new Date(draftRange.endMs));

  return (
    <>
      <RNView style={styles.container}>
        <RNView
          style={[
            styles.presetRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {DAY_PRESETS.map((option) => {
            const selected = !range && days === option;

            return (
              <Pressable
                key={option}
                onPress={() => {
                  onDaysChange(option);
                  onRangeChange(null);
                }}
                style={({ pressed }) => [
                  styles.presetButton,
                  {
                    backgroundColor: selected ? colors.tint : 'transparent',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetLabel,
                    { color: selected ? colors.buttonText : colors.text },
                  ]}
                >
                  {option}
                </Text>
                <Text
                  style={[
                    styles.presetSubLabel,
                    { color: selected ? colors.buttonText : colors.muted },
                  ]}
                >
                  days
                </Text>
              </Pressable>
            );
          })}
        </RNView>

        <Pressable
          onPress={openPicker}
          style={({ pressed }) => [
            styles.trigger,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <RNView style={styles.triggerContent}>
            <Text style={[styles.triggerLabel, { color: colors.muted }]}>
              Date range
            </Text>
            <Text style={styles.triggerValue} numberOfLines={1}>
              {summary}
            </Text>
          </RNView>
          <FontAwesome name="calendar" size={16} color={colors.muted} />
        </Pressable>
      </RNView>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <RNView style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pick a date range</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={[styles.sheetAction, { color: colors.tint }]}>Done</Text>
              </Pressable>
            </RNView>

            <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>
              Tap a start date, then tap an end date.
            </Text>

            <RNView style={styles.selectionSummary}>
              <Text style={[styles.selectionLabel, { color: colors.muted }]}>Start</Text>
              <Text style={styles.selectionValue}>{startOfDay(new Date(draftRange.startMs)).toLocaleDateString()}</Text>
              <Text style={[styles.selectionLabel, { color: colors.muted }]}>End</Text>
              <Text style={styles.selectionValue}>{startOfDay(new Date(draftRange.endMs)).toLocaleDateString()}</Text>
            </RNView>

            <RNView style={styles.calendarHeader}>
              <Pressable
                onPress={() => setCursor((value) => addMonths(value, -1))}
                style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <FontAwesome name="chevron-left" size={14} color={colors.text} />
              </Pressable>
              <Text style={styles.monthLabel}>{getMonthLabel(cursor.year, cursor.month)}</Text>
              <Pressable
                onPress={() => setCursor((value) => addMonths(value, 1))}
                style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <FontAwesome name="chevron-right" size={14} color={colors.text} />
              </Pressable>
            </RNView>

            <RNView style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((label) => (
                <Text key={label} style={[styles.weekdayLabel, { color: colors.muted }]}>
                  {label}
                </Text>
              ))}
            </RNView>

            <RNView style={styles.calendarGrid}>
              {monthCells.map((date, index) => {
                if (!date) {
                  return <RNView key={`blank-${index}`} style={styles.calendarCell} />;
                }

                const selected = sameDay(date, draftStart) || sameDay(date, draftEnd);
                const inRange = isWithinRange(date, draftRange);
                const isStart = sameDay(date, draftStart);
                const isEnd = sameDay(date, draftEnd);

                return (
                  <Pressable
                    key={date.toISOString()}
                    onPress={() => handleDayPress(date)}
                    style={({ pressed }) => [
                      styles.calendarCell,
                      {
                        backgroundColor:
                          selected || inRange ? colors.tint : 'transparent',
                        opacity: pressed ? 0.82 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarCellLabel,
                        {
                          color:
                            selected || inRange ? colors.buttonText : colors.text,
                          fontWeight: isStart || isEnd ? '700' : '500',
                        },
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </RNView>

            <RNView style={styles.footer}>
              <Pressable
                onPress={handleClear}
                style={({ pressed }) => [
                  styles.footerButton,
                  styles.secondaryButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.footerLabel, { color: colors.text }]}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                style={({ pressed }) => [
                  styles.footerButton,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.footerLabel, { color: colors.buttonText }]}>
                  Apply
                </Text>
              </Pressable>
            </RNView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  presetSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  trigger: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  triggerContent: {
    flex: 1,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  triggerValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  selectionSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectionValue: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 4,
  },
  calendarCellLabel: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  footerLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
