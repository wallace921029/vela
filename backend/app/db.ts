import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.join(__dirname, '..', 'db');

export const db = new Database(path.join(dbDir, 'vela.db'));

db.pragma('journal_mode = WAL');

export const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      nickname TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invite_codes (
      code TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      is_used INTEGER DEFAULT 0,
      used_by TEXT,
      FOREIGN KEY(used_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE
    );
  `);

  ensureColumn('users', 'status', "TEXT NOT NULL DEFAULT 'ACTIVE'");

  const initialInviteCode = process.env.INITIAL_INVITE_CODE || '000000';
  const checkInvite = db.prepare('SELECT * FROM invite_codes WHERE code = ?').get(initialInviteCode);
  if (!checkInvite) {
    db.prepare('INSERT INTO invite_codes (code, role) VALUES (?, ?)').run(initialInviteCode, 'ADMIN');
  }
};

const ensureColumn = (tableName: string, columnName: string, definition: string) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === columnName)) {
    db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`).run();
  }
};
