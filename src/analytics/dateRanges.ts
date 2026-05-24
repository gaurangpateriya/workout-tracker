import type { AnalyticsPeriod } from '@/src/types';

export interface DateBucket {
  dateKey: string;
  label: string;
  startMs: number;
  endMs: number;
}

export interface DateRangeResult {
  startMs: number;
  endMs: number;
  buckets: DateBucket[];
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getWeekdayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short' });
}

function getWeekStart(date: Date): Date {
  const start = startOfDay(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return start;
}

function buildWeekBuckets(reference: Date): DateBucket[] {
  const weekStart = getWeekStart(reference);
  const buckets: DateBucket[] = [];

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    buckets.push({
      dateKey: formatDateKey(day),
      label: getWeekdayLabel(day),
      startMs: startOfDay(day).getTime(),
      endMs: endOfDay(day).getTime(),
    });
  }

  return buckets;
}

function buildMonthBuckets(reference: Date): DateBucket[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const buckets: DateBucket[] = [];

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const day = new Date(year, month, dayNumber);
    buckets.push({
      dateKey: formatDateKey(day),
      label: getDayLabel(day),
      startMs: startOfDay(day).getTime(),
      endMs: endOfDay(day).getTime(),
    });
  }

  return buckets;
}

function buildYearBuckets(reference: Date): DateBucket[] {
  const year = reference.getFullYear();
  const buckets: DateBucket[] = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    buckets.push({
      dateKey: formatMonthKey(monthStart),
      label: getMonthLabel(monthStart),
      startMs: startOfDay(monthStart).getTime(),
      endMs: endOfDay(monthEnd).getTime(),
    });
  }

  return buckets;
}

export function getDateRange(period: AnalyticsPeriod, reference = new Date()): DateRangeResult {
  const buckets =
    period === 'week'
      ? buildWeekBuckets(reference)
      : period === 'month'
        ? buildMonthBuckets(reference)
        : buildYearBuckets(reference);

  return {
    startMs: buckets[0]?.startMs ?? startOfDay(reference).getTime(),
    endMs: buckets[buckets.length - 1]?.endMs ?? endOfDay(reference).getTime(),
    buckets,
  };
}

export function fillDailyWorkoutBuckets(
  period: AnalyticsPeriod,
  buckets: DateBucket[],
  dailyTotals: Map<string, number>
): { label: string; dateKey: string; totalSeconds: number }[] {
  if (period === 'year') {
    return buckets.map((bucket) => {
      let totalSeconds = 0;

      dailyTotals.forEach((seconds, dayKey) => {
        if (dayKey.startsWith(bucket.dateKey)) {
          totalSeconds += seconds;
        }
      });

      return {
        label: bucket.label,
        dateKey: bucket.dateKey,
        totalSeconds,
      };
    });
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    dateKey: bucket.dateKey,
    totalSeconds: dailyTotals.get(bucket.dateKey) ?? 0,
  }));
}
