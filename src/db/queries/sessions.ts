import { uuidv4 } from '@/src/utils/uuid';

import { getDatabase } from '@/src/db/database';
import { withTransaction } from '@/src/db/transaction';
import { getPlanWithExercises } from '@/src/db/queries/plans';
import { assertValidSetInput } from '@/src/utils/validateSetInput';
import type {
  ExerciseSet,
  SessionExercise,
  SessionExerciseWithSets,
  SessionMetadataUpdate,
  WorkoutSession,
  WorkoutSessionWithDetails,
} from '@/src/types';

interface SessionRow {
  id: string;
  plan_id: string;
  plan_name: string;
  started_at: number;
  completed_at: number | null;
  body_weight: number | null;
}

interface SessionExerciseRow {
  id: string;
  session_id: string;
  exercise_name: string;
  sort_order: number;
}

interface ExerciseSetRow {
  id: string;
  session_exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  logged_at: number;
  rest_before_seconds: number | null;
  set_duration_seconds: number | null;
}

function mapSession(row: SessionRow): WorkoutSession {
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    bodyWeight: row.body_weight,
  };
}

function mapSessionExercise(row: SessionExerciseRow): SessionExercise {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseName: row.exercise_name,
    sortOrder: row.sort_order,
  };
}

function mapExerciseSet(row: ExerciseSetRow): ExerciseSet {
  return {
    id: row.id,
    sessionExerciseId: row.session_exercise_id,
    setNumber: row.set_number,
    weight: row.weight,
    reps: row.reps,
    loggedAt: row.logged_at,
    restBeforeSeconds: row.rest_before_seconds,
    setDurationSeconds: row.set_duration_seconds,
  };
}

export async function startWorkout(planId: string): Promise<string> {
  const plan = await getPlanWithExercises(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const db = await getDatabase();
  const sessionId = uuidv4();
  const startedAt = Date.now();

  await withTransaction(db, async (txn) => {
    await txn.runAsync(
      `INSERT INTO workout_sessions (id, plan_id, plan_name, started_at, completed_at)
       VALUES (?, ?, ?, ?, NULL)`,
      sessionId,
      planId,
      plan.name,
      startedAt
    );

    for (const exercise of plan.exercises) {
      await txn.runAsync(
        `INSERT INTO session_exercises (id, session_id, exercise_name, sort_order)
         VALUES (?, ?, ?, ?)`,
        uuidv4(),
        sessionId,
        exercise.name,
        exercise.sortOrder
      );
    }
  });

  return sessionId;
}

export async function getSessionWithDetails(
  sessionId: string
): Promise<WorkoutSessionWithDetails | null> {
  const db = await getDatabase();
  const sessionRow = await db.getFirstAsync<SessionRow>(
    `SELECT id, plan_id, plan_name, started_at, completed_at, body_weight
     FROM workout_sessions
     WHERE id = ?`,
    sessionId
  );

  if (!sessionRow) {
    return null;
  }

  const exerciseRows = await db.getAllAsync<SessionExerciseRow>(
    `SELECT id, session_id, exercise_name, sort_order
     FROM session_exercises
     WHERE session_id = ?
     ORDER BY sort_order ASC`,
    sessionId
  );

  const exercises: SessionExerciseWithSets[] = [];

  for (const exerciseRow of exerciseRows) {
    const setRows = await db.getAllAsync<ExerciseSetRow>(
      `SELECT id, session_exercise_id, set_number, weight, reps, logged_at,
              rest_before_seconds, set_duration_seconds
       FROM exercise_sets
       WHERE session_exercise_id = ?
       ORDER BY set_number ASC`,
      exerciseRow.id
    );

    exercises.push({
      ...mapSessionExercise(exerciseRow),
      sets: setRows.map(mapExerciseSet),
    });
  }

  return {
    ...mapSession(sessionRow),
    exercises,
  };
}

export async function addSet(
  sessionExerciseId: string,
  weight: number,
  reps: number,
  setDurationSeconds: number
): Promise<ExerciseSet> {
  assertValidSetInput(weight, reps);

  const duration = Math.max(0, Math.round(setDurationSeconds));

  const db = await getDatabase();
  const loggedAt = Date.now();

  const lastSet = await db.getFirstAsync<{ set_number: number; logged_at: number }>(
    `SELECT set_number, logged_at
     FROM exercise_sets
     WHERE session_exercise_id = ?
     ORDER BY set_number DESC
     LIMIT 1`,
    sessionExerciseId
  );

  const setNumber = (lastSet?.set_number ?? 0) + 1;
  const restBeforeSeconds = lastSet
    ? Math.round((loggedAt - lastSet.logged_at) / 1000)
    : null;
  const setId = uuidv4();

  await db.runAsync(
    `INSERT INTO exercise_sets (
       id, session_exercise_id, set_number, weight, reps, logged_at,
       rest_before_seconds, set_duration_seconds
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    setId,
    sessionExerciseId,
    setNumber,
    weight,
    reps,
    loggedAt,
    restBeforeSeconds,
    duration
  );

  return {
    id: setId,
    sessionExerciseId,
    setNumber,
    weight,
    reps,
    loggedAt,
    restBeforeSeconds,
    setDurationSeconds: duration,
  };
}

export async function finishWorkout(sessionId: string): Promise<void> {
  const db = await getDatabase();
  const completedAt = Date.now();

  const result = await db.runAsync(
    `UPDATE workout_sessions
     SET completed_at = ?
     WHERE id = ? AND completed_at IS NULL`,
    completedAt,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error(`Active session not found: ${sessionId}`);
  }
}

export async function updateSessionMetadata(
  sessionId: string,
  metadata: SessionMetadataUpdate
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if ('bodyWeight' in metadata) {
    updates.push('body_weight = ?');
    values.push(metadata.bodyWeight ?? null);
  }

  if (updates.length === 0) {
    return;
  }

  const db = await getDatabase();
  const result = await db.runAsync(
    `UPDATE workout_sessions
     SET ${updates.join(', ')}
     WHERE id = ? AND completed_at IS NOT NULL`,
    ...values,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error(`Completed session not found: ${sessionId}`);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `DELETE FROM workout_sessions
     WHERE id = ? AND completed_at IS NOT NULL`,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error(`Completed session not found: ${sessionId}`);
  }
}

export async function getActiveSession(): Promise<WorkoutSession | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SessionRow>(
    `SELECT id, plan_id, plan_name, started_at, completed_at, body_weight
     FROM workout_sessions
     WHERE completed_at IS NULL
     ORDER BY started_at DESC
     LIMIT 1`
  );

  return row ? mapSession(row) : null;
}
