import type { DashboardDateRange } from '@/src/analytics/types';

export interface DateBucket {
  dateKey: string;
  label: string;
  startMs: number;
  endMs: number;
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

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeRange(range: DashboardDateRange): DashboardDateRange {
  return range.startMs <= range.endMs
    ? range
    : { startMs: range.endMs, endMs: range.startMs };
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatCalendarDate(date: Date, includeYear: boolean): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

export function formatRangeLabel(range: DashboardDateRange): string {
  const normalized = normalizeRange(range);
  const start = new Date(normalized.startMs);
  const end = new Date(normalized.endMs);
  const includeYear = start.getFullYear() !== end.getFullYear();

  return `${formatCalendarDate(start, includeYear)} - ${formatCalendarDate(
    end,
    true
  )}`;
}

export function getLastNDaysRange(days: number, reference = new Date()): DashboardDateRange {
  const safeDays = Math.max(1, Math.round(days));
  const end = endOfDay(reference);
  const start = startOfDay(addDays(end, 1 - safeDays));

  return {
    startMs: start.getTime(),
    endMs: end.getTime(),
  };
}

export function buildDateBuckets(range: DashboardDateRange): DateBucket[] {
  const normalized = normalizeRange(range);
  const buckets: DateBucket[] = [];
  let cursor = startOfDay(new Date(normalized.startMs));
  const end = startOfDay(new Date(normalized.endMs));

  while (cursor.getTime() <= end.getTime()) {
    buckets.push({
      dateKey: formatDateKey(cursor),
      label: formatDayLabel(cursor),
      startMs: startOfDay(cursor).getTime(),
      endMs: endOfDay(cursor).getTime(),
    });

    cursor = addDays(cursor, 1);
  }

  return buckets;
}

export function fillDailyWorkoutBuckets(
  buckets: DateBucket[],
  dailyTotals: Map<string, number>
): { label: string; dateKey: string; totalSeconds: number }[] {
  return buckets.map((bucket) => ({
    label: bucket.label,
    dateKey: bucket.dateKey,
    totalSeconds: dailyTotals.get(bucket.dateKey) ?? 0,
  }));
}
