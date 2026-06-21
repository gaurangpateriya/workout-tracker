export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS workout_plans (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS plan_exercises (
    id TEXT PRIMARY KEY NOT NULL,
    plan_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS exercise_catalog (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS workout_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    body_weight REAL
  )`,
  `CREATE TABLE IF NOT EXISTS session_exercises (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    source_plan_exercise_id TEXT,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS exercise_sets (
    id TEXT PRIMARY KEY NOT NULL,
    session_exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    logged_at INTEGER NOT NULL,
    rest_before_seconds INTEGER,
    set_duration_seconds INTEGER,
    FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_id ON plan_exercises(plan_id)`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_catalog_name ON exercise_catalog(name COLLATE NOCASE)`,
  `CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id ON session_exercises(session_id)`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_sets_session_exercise_id ON exercise_sets(session_exercise_id)`,
  `CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON workout_sessions(completed_at)`,
];
