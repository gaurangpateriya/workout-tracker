import * as SQLite from 'expo-sqlite';

import { DEFAULT_EXERCISES } from '@/src/data/defaultExercises';
import { SCHEMA_STATEMENTS } from './schema';
import { withTransaction } from './transaction';
import { uuidv4 } from '@/src/utils/uuid';

const DB_NAME = 'workout_tracker.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function columnExists(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string
): Promise<boolean> {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`
  );
  return columns.some((entry) => entry.name === column);
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  if (!(await columnExists(db, 'exercise_sets', 'set_duration_seconds'))) {
    await db.execAsync(
      `ALTER TABLE exercise_sets ADD COLUMN set_duration_seconds INTEGER`
    );
  }

  if (!(await columnExists(db, 'workout_sessions', 'body_weight'))) {
    await db.execAsync(`ALTER TABLE workout_sessions ADD COLUMN body_weight REAL`);
  }
}

async function seedExerciseCatalog(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM exercise_catalog'
  );

  if ((row?.count ?? 0) > 0) {
    return;
  }

  const createdAt = Date.now();
  await withTransaction(db, async (txn) => {
    for (const name of DEFAULT_EXERCISES) {
      await txn.runAsync(
        'INSERT OR IGNORE INTO exercise_catalog (id, name, created_at) VALUES (?, ?, ?)',
        uuidv4(),
        name,
        createdAt
      );
    }
  });
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    for (const statement of SCHEMA_STATEMENTS) {
      await db.execAsync(statement);
    }

    await runMigrations(db);
    await seedExerciseCatalog(db);

    dbInstance = db;
    return db;
  })();

  return initPromise;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initDatabase();
}
