import { getDatabase } from '@/src/db/database';
import type {
  DailyWorkoutTimePoint,
  ExerciseSessionStats,
  BodyWeightEntry,
} from '@/src/types';
import {
  buildDateBuckets,
  fillDailyWorkoutBuckets,
  type DateBucket,
} from '@/src/analytics/dateRanges';
import type { DashboardDateRange } from '@/src/analytics/types';

interface DailyWorkoutRow {
  day_key: string;
  total_seconds: number;
}

interface ExerciseSessionRow {
  session_id: string;
  completed_at: number;
  max_weight: number;
  max_reps: number;
}

export async function getDailyWorkoutTimeByDay(
  startMs: number,
  endMs: number
): Promise<Map<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DailyWorkoutRow>(
    `SELECT
       date(s.completed_at / 1000, 'unixepoch', 'localtime') AS day_key,
       SUM(s.completed_at - s.started_at) / 1000 AS total_seconds
     FROM workout_sessions s
     WHERE s.completed_at IS NOT NULL
       AND s.completed_at BETWEEN ? AND ?
     GROUP BY day_key
     ORDER BY day_key ASC`,
    startMs,
    endMs
  );

  const totals = new Map<string, number>();

  for (const row of rows) {
    totals.set(row.day_key, Math.round(row.total_seconds));
  }

  return totals;
}

export async function getDailyWorkoutTime(
  range: DashboardDateRange
): Promise<DailyWorkoutTimePoint[]> {
  const buckets = buildDateBuckets(range);
  const { startMs, endMs } = range;
  const dailyTotals = await getDailyWorkoutTimeByDay(startMs, endMs);
  return fillDailyWorkoutBuckets(buckets, dailyTotals);
}

export async function getLoggedExerciseNames(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ exercise_name: string }>(
    `SELECT DISTINCT se.exercise_name
     FROM session_exercises se
     JOIN workout_sessions s ON s.id = se.session_id
     WHERE s.completed_at IS NOT NULL
     ORDER BY se.exercise_name COLLATE NOCASE ASC`
  );

  return rows.map((row) => row.exercise_name);
}

export async function getExerciseSessionStats(
  exerciseName: string,
  startMs: number,
  endMs: number
): Promise<ExerciseSessionStats[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseSessionRow>(
    `SELECT
       s.id AS session_id,
       s.completed_at,
       MAX(es.weight) AS max_weight,
       MAX(es.reps) AS max_reps
     FROM workout_sessions s
     JOIN session_exercises se ON se.session_id = s.id
     JOIN exercise_sets es ON es.session_exercise_id = se.id
     WHERE s.completed_at IS NOT NULL
       AND se.exercise_name = ?
       AND s.completed_at BETWEEN ? AND ?
     GROUP BY s.id
     ORDER BY s.completed_at ASC`,
    exerciseName,
    startMs,
    endMs
  );

  return rows.map((row) => ({
    sessionId: row.session_id,
    completedAt: row.completed_at,
    maxWeight: row.max_weight,
    maxReps: row.max_reps,
  }));
}

export async function getExerciseProgress(
  exerciseName: string,
  range: DashboardDateRange
): Promise<ExerciseSessionStats[]> {
  const { startMs, endMs } = range;
  return getExerciseSessionStats(exerciseName, startMs, endMs);
}

interface BodyWeightRow {
  session_id: string;
  completed_at: number;
  body_weight: number;
}

export async function getBodyWeightEntries(
  startMs: number,
  endMs: number
): Promise<BodyWeightEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BodyWeightRow>(
    `SELECT id AS session_id, completed_at, body_weight
     FROM workout_sessions
     WHERE completed_at IS NOT NULL
       AND body_weight IS NOT NULL
       AND completed_at BETWEEN ? AND ?
     ORDER BY completed_at ASC`,
    startMs,
    endMs
  );

  return rows.map((row) => ({
    sessionId: row.session_id,
    completedAt: row.completed_at,
    bodyWeight: row.body_weight,
  }));
}

export async function getBodyWeightHistory(
  range: DashboardDateRange
): Promise<BodyWeightEntry[]> {
  const { startMs, endMs } = range;
  return getBodyWeightEntries(startMs, endMs);
}

export function getRangeBuckets(range: DashboardDateRange): DateBucket[] {
  return buildDateBuckets(range);
}
