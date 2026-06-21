export interface WorkoutPlan {
  id: string;
  name: string;
  createdAt: number;
}

export interface PlanExercise {
  id: string;
  planId: string;
  name: string;
  sortOrder: number;
}

export interface WorkoutPlanWithExercises extends WorkoutPlan {
  exercises: PlanExercise[];
}

export interface WorkoutPlanSummary extends WorkoutPlan {
  exerciseCount: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  planName: string;
  startedAt: number;
  completedAt: number | null;
  bodyWeight: number | null;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseName: string;
  sortOrder: number;
  sourcePlanExerciseId: string | null;
}

export interface ExerciseSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  loggedAt: number;
  restBeforeSeconds: number | null;
  setDurationSeconds: number | null;
}

export interface SessionExerciseWithSets extends SessionExercise {
  sets: ExerciseSet[];
}

export interface WorkoutSessionWithDetails extends WorkoutSession {
  exercises: SessionExerciseWithSets[];
}

export interface CompletedSessionSummary {
  id: string;
  planId: string;
  planName: string;
  startedAt: number;
  completedAt: number;
  exerciseCount: number;
  durationSeconds: number;
}

export interface ActiveSetState {
  exerciseId: string;
  startedAt: number;
}

/** In-memory shape of an active (in-progress) workout session. */
export interface ActiveWorkout {
  sessionId: string;
  planId: string;
  planName: string;
  startedAt: number;
  exercises: SessionExerciseWithSets[];
  lastSetLoggedAt: number | null;
  activeSet: ActiveSetState | null;
  restStartedAt: number | null;
}

export interface CatalogExercise {
  id: string;
  name: string;
  createdAt: number;
}

export type AnalyticsPeriod = 'week' | 'month' | 'year';

export interface DailyWorkoutTimePoint {
  label: string;
  dateKey: string;
  totalSeconds: number;
}

export interface ExerciseSessionStats {
  sessionId: string;
  completedAt: number;
  maxWeight: number;
  maxReps: number;
}

export interface BodyWeightEntry {
  sessionId: string;
  completedAt: number;
  bodyWeight: number;
}

export interface SessionMetadataUpdate {
  bodyWeight?: number | null;
}
