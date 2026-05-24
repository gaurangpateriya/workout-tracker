import { ensureExercisesInCatalog } from '@/src/db/queries/exercises';
import { getDatabase } from '@/src/db/database';
import { withTransaction } from '@/src/db/transaction';
import type {
  PlanExercise,
  WorkoutPlan,
  WorkoutPlanSummary,
  WorkoutPlanWithExercises,
} from '@/src/types';

interface PlanRow {
  id: string;
  name: string;
  created_at: number;
}

interface PlanSummaryRow extends PlanRow {
  exercise_count: number;
}

interface PlanExerciseRow {
  id: string;
  plan_id: string;
  name: string;
  sort_order: number;
}

function mapPlan(row: PlanRow): WorkoutPlan {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function mapPlanExercise(row: PlanExerciseRow): PlanExercise {
  return {
    id: row.id,
    planId: row.plan_id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

export async function getAllPlans(): Promise<WorkoutPlanSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlanSummaryRow>(
    `SELECT
       p.id,
       p.name,
       p.created_at,
       COUNT(e.id) AS exercise_count
     FROM workout_plans p
     LEFT JOIN plan_exercises e ON e.plan_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );

  return rows.map((row) => ({
    ...mapPlan(row),
    exerciseCount: row.exercise_count,
  }));
}

export async function getPlanWithExercises(
  planId: string
): Promise<WorkoutPlanWithExercises | null> {
  const db = await getDatabase();
  const planRow = await db.getFirstAsync<PlanRow>(
    'SELECT id, name, created_at FROM workout_plans WHERE id = ?',
    planId
  );

  if (!planRow) {
    return null;
  }

  const exerciseRows = await db.getAllAsync<PlanExerciseRow>(
    `SELECT id, plan_id, name, sort_order
     FROM plan_exercises
     WHERE plan_id = ?
     ORDER BY sort_order ASC`,
    planId
  );

  return {
    ...mapPlan(planRow),
    exercises: exerciseRows.map(mapPlanExercise),
  };
}

export interface UpsertPlanInput {
  id: string;
  name: string;
  createdAt?: number;
}

export interface UpsertPlanExerciseInput {
  id: string;
  name: string;
  sortOrder: number;
}

export async function upsertPlan(
  plan: UpsertPlanInput,
  exercises: UpsertPlanExerciseInput[]
): Promise<void> {
  const db = await getDatabase();

  await withTransaction(db, async (txn) => {
    const existing = await txn.getFirstAsync<{ created_at: number }>(
      'SELECT created_at FROM workout_plans WHERE id = ?',
      plan.id
    );
    const createdAt = existing?.created_at ?? plan.createdAt ?? Date.now();

    await txn.runAsync(
      'INSERT OR REPLACE INTO workout_plans (id, name, created_at) VALUES (?, ?, ?)',
      plan.id,
      plan.name,
      createdAt
    );

    await txn.runAsync('DELETE FROM plan_exercises WHERE plan_id = ?', plan.id);

    for (const exercise of exercises) {
      await txn.runAsync(
        'INSERT INTO plan_exercises (id, plan_id, name, sort_order) VALUES (?, ?, ?, ?)',
        exercise.id,
        plan.id,
        exercise.name,
        exercise.sortOrder
      );
    }
  });

  await ensureExercisesInCatalog(exercises.map((exercise) => exercise.name));
}

export async function deletePlan(planId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workout_plans WHERE id = ?', planId);
}

export async function getPlanExercises(planId: string): Promise<PlanExercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlanExerciseRow>(
    `SELECT id, plan_id, name, sort_order
     FROM plan_exercises
     WHERE plan_id = ?
     ORDER BY sort_order ASC`,
    planId
  );

  return rows.map(mapPlanExercise);
}
