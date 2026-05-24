import { Platform } from 'react-native';
import type * as SQLite from 'expo-sqlite';

type Database = SQLite.SQLiteDatabase;

export async function withTransaction(
  db: Database,
  task: (txn: Database) => Promise<void>
): Promise<void> {
  if (Platform.OS === 'web') {
    await db.execAsync('BEGIN');
    try {
      await task(db);
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
    return;
  }

  await db.withExclusiveTransactionAsync(task);
}
