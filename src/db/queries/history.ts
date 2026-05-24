import { getDatabase } from '@/src/db/database';
import type { CompletedSessionSummary, WorkoutSessionWithDetails } from '@/src/types';
import { getSessionWithDetails } from '@/src/db/queries/sessions';

interface CompletedSessionRow {
  id: string;
  plan_id: string;
  plan_name: string;
  started_at: number;
  completed_at: number;
  exercise_count: number;
}

export async function getCompletedSessions(): Promise<CompletedSessionSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CompletedSessionRow>(
    `SELECT
       s.id,
       s.plan_id,
       s.plan_name,
       s.started_at,
       s.completed_at,
       COUNT(DISTINCT se.id) AS exercise_count
     FROM workout_sessions s
     LEFT JOIN session_exercises se ON se.session_id = s.id
     WHERE s.completed_at IS NOT NULL
     GROUP BY s.id
     ORDER BY s.completed_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    exerciseCount: row.exercise_count,
    durationSeconds: Math.round((row.completed_at - row.started_at) / 1000),
  }));
}

export async function getSessionDetail(
  sessionId: string
): Promise<WorkoutSessionWithDetails | null> {
  const session = await getSessionWithDetails(sessionId);

  if (!session || session.completedAt === null) {
    return null;
  }

  return session;
}
