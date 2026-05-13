import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

// Use an absolute path for the sqlite database file
const dbDir = path.join(__dirname, 'db');
const db = new Database(path.join(dbDir, 'vela.db'));
db.pragma('journal_mode = WAL');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
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

// Seed default admin invite code if not exists
const checkInvite = db.prepare('SELECT * FROM invite_codes WHERE code = ?').get('000000');
if (!checkInvite) {
  db.prepare('INSERT INTO invite_codes (code, role) VALUES (?, ?)').run('000000', 'ADMIN');
}

fastify.register(cors, {
  origin: '*'
});

// Register JWT
fastify.register(fastifyJwt, {
  secret: 'super-secret-key-vela-app-change-in-prod' // In production, use env variable
});

fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// AUTH ENDPOINTS
fastify.post('/api/auth/register', async (request, reply) => {
  const { email, password, inviteCode, nickname, avatarUrl } = request.body as any;

  if (!email || !password || !inviteCode) {
    return reply.status(400).send({ error: 'Email, password and invite code are required' });
  }

  // Verify invite code
  const codeRow = db.prepare('SELECT * FROM invite_codes WHERE code = ? AND is_used = 0').get(inviteCode) as any;
  if (!codeRow) {
    return reply.status(400).send({ error: 'Invalid or already used invite code' });
  }

  // Check email
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return reply.status(400).send({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const role = codeRow.role;

  const insertUser = db.prepare('INSERT INTO users (id, email, password, role, nickname, avatar_url) VALUES (?, ?, ?, ?, ?, ?)');
  const updateCode = db.prepare('UPDATE invite_codes SET is_used = 1, used_by = ? WHERE code = ?');

  const transaction = db.transaction(() => {
    insertUser.run(userId, email, hashedPassword, role, nickname || null, avatarUrl || null);
    updateCode.run(userId, inviteCode);
  });

  try {
    transaction();
    return { success: true, message: 'User registered successfully' };
  } catch (e) {
    return reply.status(500).send({ error: 'Registration failed' });
  }
});

fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as any;

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  const token = fastify.jwt.sign({ 
    id: user.id, 
    email: user.email, 
    role: user.role,
    nickname: user.nickname,
    avatarUrl: user.avatar_url
  });

  return { token, user: { id: user.id, email: user.email, role: user.role, nickname: user.nickname, avatarUrl: user.avatar_url } };
});

fastify.get('/api/auth/me', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const user = db.prepare('SELECT id, email, role, nickname, avatar_url FROM users WHERE id = ?').get(request.user.id);
  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }
  return user;
});

// Admin endpoints
fastify.post('/api/admin/invites', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  if (request.user.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
  const { role } = request.body as any; // 'ADMIN' or 'USER'
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  db.prepare('INSERT INTO invite_codes (code, role) VALUES (?, ?)').run(newCode, role || 'USER');
  return { code: newCode };
});

fastify.get('/api/admin/invites', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  if (request.user.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
  const codes = db.prepare('SELECT * FROM invite_codes').all();
  return codes;
});


// GET /api/nav - Fetch all navigation data for the authenticated user
fastify.get('/api/nav', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const userId = request.user.id;
  const groups = db.prepare('SELECT * FROM groups WHERE user_id = ? ORDER BY order_index ASC').all(userId) as any[];
  
  if (groups.length === 0) return [];

  const groupIds = groups.map(g => `'${g.id}'`).join(',');
  const items = db.prepare(`SELECT * FROM items WHERE group_id IN (${groupIds}) ORDER BY order_index ASC`).all() as any[];

  const result = groups.map((g) => {
    return {
      id: g.id,
      title: g.title,
      items: items
        .filter((i) => i.group_id === g.id)
        .map((i) => ({
          id: i.id,
          url: i.url,
          icon: i.icon || undefined,
          title: i.title,
          description: i.description || undefined
        }))
    };
  });

  return result;
});

// PUT /api/nav - Sync entire navigation state (atomic operation) for the authenticated user
fastify.put('/api/nav', { preValidation: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const newGroups = request.body as any[];
  const userId = request.user.id;

  if (!Array.isArray(newGroups)) {
    return reply.status(400).send({ error: 'Body must be an array of groups' });
  }

  const insertGroup = db.prepare('INSERT INTO groups (id, user_id, title, order_index) VALUES (?, ?, ?, ?)');
  const insertItem = db.prepare('INSERT INTO items (id, group_id, url, icon, title, description, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)');

  const syncData = db.transaction((groupsToSync: any[]) => {
    // Clear existing data for this user
    const existingGroups = db.prepare('SELECT id FROM groups WHERE user_id = ?').all(userId) as any[];
    if (existingGroups.length > 0) {
      const gIds = existingGroups.map(g => `'${g.id}'`).join(',');
      db.prepare(`DELETE FROM items WHERE group_id IN (${gIds})`).run();
      db.prepare('DELETE FROM groups WHERE user_id = ?').run(userId);
    }

    // Insert new data preserving order index
    groupsToSync.forEach((g, gIdx) => {
      insertGroup.run(g.id, userId, g.title, gIdx);
      if (Array.isArray(g.items)) {
        g.items.forEach((item, iIdx) => {
          insertItem.run(
            item.id,
            g.id,
            item.url,
            item.icon || null,
            item.title,
            item.description || null,
            iIdx
          );
        });
      }
    });
  });

  syncData(newGroups);
  return { success: true };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Backend listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();