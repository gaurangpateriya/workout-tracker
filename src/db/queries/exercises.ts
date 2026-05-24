import { uuidv4 } from '@/src/utils/uuid';

import { getDatabase } from '@/src/db/database';
import type { CatalogExercise } from '@/src/types';

interface CatalogRow {
  id: string;
  name: string;
  created_at: number;
}

function mapCatalogExercise(row: CatalogRow): CatalogExercise {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export async function getAllCatalogExercises(): Promise<CatalogExercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CatalogRow>(
    `SELECT id, name, created_at
     FROM exercise_catalog
     ORDER BY name COLLATE NOCASE ASC`
  );

  return rows.map(mapCatalogExercise);
}

export async function searchCatalogExercises(
  query: string
): Promise<CatalogExercise[]> {
  const trimmed = query.trim();
  const db = await getDatabase();

  if (!trimmed) {
    return getAllCatalogExercises();
  }

  const pattern = `%${trimmed.replace(/[%_]/g, '')}%`;
  const rows = await db.getAllAsync<CatalogRow>(
    `SELECT id, name, created_at
     FROM exercise_catalog
     WHERE name LIKE ? COLLATE NOCASE
     ORDER BY
       CASE WHEN name = ? COLLATE NOCASE THEN 0
            WHEN name LIKE ? COLLATE NOCASE THEN 1
            ELSE 2 END,
       name COLLATE NOCASE ASC
     LIMIT 50`,
    pattern,
    trimmed,
    `${trimmed}%`
  );

  return rows.map(mapCatalogExercise);
}

export async function ensureExerciseInCatalog(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    return;
  }

  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO exercise_catalog (id, name, created_at) VALUES (?, ?, ?)`,
    uuidv4(),
    trimmed,
    Date.now()
  );
}

export async function ensureExercisesInCatalog(names: string[]): Promise<void> {
  for (const name of names) {
    await ensureExerciseInCatalog(name);
  }
}
