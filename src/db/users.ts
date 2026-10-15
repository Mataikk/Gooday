import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Local accounts. Everything stays on the device: there is no server.
 *
 * Passwords are never stored in clear text: we store a salted, iterated
 * SHA-256 hash formatted as `sha256$<iterations>$<salt>$<hash>`, so the
 * parameters can be strengthened later without breaking existing accounts.
 *
 * Note: this protects access to the app, but the database file itself is
 * not encrypted.
 */

export type User = {
  id: number;
  name: string;
  createdAt: number;
};

type UserRow = {
  id: number;
  name: string;
  password_hash: string;
  created_at: number;
};

export class NameTakenError extends Error {
  constructor() {
    super('An account with this name already exists');
  }
}

const HASH_ITERATIONS = 1000;
const SESSION_KEY = 'session_user_id';

const toUser = (row: Pick<UserRow, 'id' | 'name' | 'created_at'>): User => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
});

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function derive(password: string, salt: string, iterations: number): Promise<string> {
  let hash = `${salt}:${password}`;
  for (let i = 0; i < iterations; i++) {
    hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${hash}`);
  }
  return hash;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = toHex(Crypto.getRandomBytes(16));
  const hash = await derive(password, salt, HASH_ITERATIONS);
  return `sha256$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterations, salt, expected] = stored.split('$');
  if (algorithm !== 'sha256' || !iterations || !salt || !expected) return false;
  const hash = await derive(password, salt, Number(iterations));
  return hash === expected;
}

export async function countUsers(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM users');
  return row?.count ?? 0;
}

export async function getUser(db: SQLiteDatabase, id: number): Promise<User | null> {
  const row = await db.getFirstAsync<UserRow>(
    'SELECT id, name, created_at FROM users WHERE id = ?',
    id
  );
  return row ? toUser(row) : null;
}

/**
 * Creates an account. The first account created on the device also takes
 * over the entries written before accounts existed.
 * @throws NameTakenError if the name is already used (case-insensitive).
 */
export async function createUser(
  db: SQLiteDatabase,
  name: string,
  password: string
): Promise<User> {
  const existing = await db.getFirstAsync('SELECT id FROM users WHERE name = ?', name);
  if (existing) throw new NameTakenError();

  const passwordHash = await hashPassword(password);
  const now = Date.now();
  let user: User | null = null;

  await db.withTransactionAsync(async () => {
    const isFirst = (await countUsers(db)) === 0;
    const result = await db.runAsync(
      'INSERT INTO users (name, password_hash, created_at) VALUES (?, ?, ?)',
      name,
      passwordHash,
      now
    );
    const id = result.lastInsertRowId;
    if (isFirst) {
      await db.runAsync('UPDATE entries SET user_id = ? WHERE user_id IS NULL', id);
    }
    user = { id, name, createdAt: now };
  });

  return user!;
}

/** Returns the user if the name/password pair is correct, otherwise null. */
export async function authenticate(
  db: SQLiteDatabase,
  name: string,
  password: string
): Promise<User | null> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE name = ?', name);
  if (!row) return null;
  return (await verifyPassword(password, row.password_hash)) ? toUser(row) : null;
}

/** Deletes the account and, through ON DELETE CASCADE, all of its entries. */
export async function deleteUser(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM users WHERE id = ?', id);
}

// --- Session: which user stays signed in between launches ---

export async function getSessionUserId(db: SQLiteDatabase): Promise<number | null> {
  const row = await db.getFirstAsync<{ value: string | null }>(
    'SELECT value FROM app_state WHERE key = ?',
    SESSION_KEY
  );
  return row?.value ? Number(row.value) : null;
}

export async function setSessionUserId(db: SQLiteDatabase, id: number | null) {
  if (id === null) {
    await db.runAsync('DELETE FROM app_state WHERE key = ?', SESSION_KEY);
  } else {
    await db.runAsync(
      'INSERT INTO app_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      SESSION_KEY,
      String(id)
    );
  }
}
