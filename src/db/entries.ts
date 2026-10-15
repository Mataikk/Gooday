import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A journal entry: one per user per day.
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

const toEntry = (row: EntryRow): Entry => ({
  date: row.date,
  rating: row.rating,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const COLUMNS = 'date, rating, content, created_at, updated_at';

export async function getEntry(
  db: SQLiteDatabase,
  userId: number,
  date: string
): Promise<Entry | null> {
  const row = await db.getFirstAsync<EntryRow>(
    `SELECT ${COLUMNS} FROM entries WHERE user_id = ? AND date = ?`,
    userId,
    date
  );
  return row ? toEntry(row) : null;
}

export async function listEntries(db: SQLiteDatabase, userId: number): Promise<Entry[]> {
  const rows = await db.getAllAsync<EntryRow>(
    `SELECT ${COLUMNS} FROM entries WHERE user_id = ? ORDER BY date DESC`,
    userId
  );
  return rows.map(toEntry);
}

/**
 * Saves a day's entry (insert or update).
 * An empty entry (no text and no rating) is deleted instead of stored.
 */
export async function saveEntry(
  db: SQLiteDatabase,
  userId: number,
  date: string,
  values: { rating: number | null; content: string }
) {
  if (values.rating === null && values.content.trim() === '') {
    await deleteEntry(db, userId, date);
    return;
  }
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO entries (user_id, date, rating, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET
       rating = excluded.rating,
       content = excluded.content,
       updated_at = excluded.updated_at`,
    userId,
    date,
    values.rating,
    values.content,
    now,
    now
  );
}

export async function deleteEntry(db: SQLiteDatabase, userId: number, date: string) {
  await db.runAsync('DELETE FROM entries WHERE user_id = ? AND date = ?', userId, date);
}
