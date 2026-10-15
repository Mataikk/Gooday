import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'gooday.db';

const DATABASE_VERSION = 2;

/**
 * Runs on every app launch (SQLiteProvider `onInit`): enables foreign keys and
 * creates or upgrades the schema.
 *
 * For each schema change, bump DATABASE_VERSION and add a new
 * `if (version < N)` block, never editing the existing ones: devices that
 * already have the app then catch up step by step.
 */
export async function migrateDatabase(db: SQLiteDatabase) {
  // Foreign keys are off by default in SQLite and must be enabled per connection.
  await db.execAsync('PRAGMA foreign_keys = ON');

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

  if (version < 2) {
    // Local accounts: each entry now belongs to a user (one entry per user per day).
    // Entries written before accounts existed keep user_id = NULL and are
    // claimed by the first account created on the device (see createUser).
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE users (
          id            INTEGER PRIMARY KEY AUTOINCREMENT,
          name          TEXT NOT NULL UNIQUE COLLATE NOCASE,
          password_hash TEXT NOT NULL,
          created_at    INTEGER NOT NULL
        );

        CREATE TABLE app_state (
          key   TEXT PRIMARY KEY NOT NULL,
          value TEXT
        );

        CREATE TABLE entries_v2 (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
          date       TEXT NOT NULL,
          rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
          content    TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          UNIQUE (user_id, date)
        );

        INSERT INTO entries_v2 (user_id, date, rating, content, created_at, updated_at)
          SELECT NULL, date, rating, content, created_at, updated_at FROM entries;

        DROP TABLE entries;
        ALTER TABLE entries_v2 RENAME TO entries;
      `);
    });
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
