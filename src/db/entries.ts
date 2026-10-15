import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A journal entry: one per day (the date is the primary key).
 * `rating` is null until the day has been rated.
 */
export type Entry = {
  date: string; // 'YYYY-MM-DD'
  rating: number | null; // 1 to 5
  content: string;
  createdAt: number; // timestamp in ms
  updatedAt: number;
};

type EntryRow = {
  date: string;
  rating: number | null;
  content: string;
  created_at: number;
  updated_at: number;
};

export const DATABASE_NAME = 'gooday.db';

const toEntry = (row: EntryRow): Entry => ({
  date: row.date,
  rating: row.rating,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Creates or upgrades the schema. For each schema change, bump
 * DATABASE_VERSION and add a new `if (version < N)` block, never editing the
 * existing ones: devices that already have the app then catch up step by step.
 */
export async function migrateDatabase(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = result?.user_version ?? 0;

  if (version >= DATABASE_VERSION) return;

  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS entries (
        date       TEXT PRIMARY KEY NOT NULL,
        rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
        content    TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function getEntry(db: SQLiteDatabase, date: string): Promise<Entry | null> {
  const row = await db.getFirstAsync<EntryRow>('SELECT * FROM entries WHERE date = ?', date);
  return row ? toEntry(row) : null;
}

export async function listEntries(db: SQLiteDatabase): Promise<Entry[]> {
  const rows = await db.getAllAsync<EntryRow>('SELECT * FROM entries ORDER BY date DESC');
  return rows.map(toEntry);
}

/**
 * Saves a day's entry (insert or update).
 * An empty entry (no text and no rating) is deleted instead of stored.
 */
export async function saveEntry(
  db: SQLiteDatabase,
  date: string,
  values: { rating: number | null; content: string }
) {
  const content = values.content;
  if (values.rating === null && content.trim() === '') {
    await deleteEntry(db, date);
    return;
  }
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO entries (date, rating, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       rating = excluded.rating,
       content = excluded.content,
       updated_at = excluded.updated_at`,
    date,
    values.rating,
    content,
    now,
    now
  );
}

export async function deleteEntry(db: SQLiteDatabase, date: string) {
  await db.runAsync('DELETE FROM entries WHERE date = ?', date);
}
