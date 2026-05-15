import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db.js';
import type { AuthUser, InviteCodeRow, UserRow } from '../types.js';

const JWT_EXPIRES_IN = '90d';

interface RegisterBody {
  email?: string;
  password?: string;
  inviteCode?: string;
  nickname?: string;
  avatarUrl?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface UpdateProfileBody {
  nickname?: string;
  avatarUrl?: string | null;
}

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export const registerAuthRoutes = (fastify: FastifyInstance) => {
  fastify.post('/api/auth/register', registerUser);
  fastify.post('/api/auth/login', loginUser);
  fastify.get('/api/auth/me', { preValidation: [(fastify as any).authenticate] }, getCurrentUser);
  fastify.patch('/api/auth/profile', { preValidation: [(fastify as any).authenticate] }, updateProfile);
  fastify.patch('/api/auth/password', { preValidation: [(fastify as any).authenticate] }, changePassword);

  /**
   * Creates a new user from a valid unused invite code and consumes that code atomically.
   */
  async function registerUser(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    const { email, password, inviteCode, nickname, avatarUrl } = request.body;

    if (!email || !password || !inviteCode) {
      return reply.status(400).send({ error: 'Email, password and invite code are required' });
    }

    const codeRow = db.prepare('SELECT * FROM invite_codes WHERE code = ? AND is_used = 0').get(inviteCode) as InviteCodeRow | undefined;
    if (!codeRow) {
      return reply.status(400).send({ error: 'Invalid or already used invite code' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return reply.status(400).send({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const insertUser = db.prepare('INSERT INTO users (id, email, password, role, nickname, avatar_url) VALUES (?, ?, ?, ?, ?, ?)');
    const updateCode = db.prepare('UPDATE invite_codes SET is_used = 1, used_by = ? WHERE code = ?');

    const transaction = db.transaction(() => {
      insertUser.run(userId, email, hashedPassword, codeRow.role, nickname || null, avatarUrl || null);
      updateCode.run(userId, inviteCode);
    });

    try {
      transaction();
      return { success: true, message: 'User registered successfully' };
    } catch {
      return reply.status(500).send({ error: 'Registration failed' });
    }
  }

  /**
   * Authenticates a user by email and password, then returns a signed JWT and public user profile.
   */
  async function loginUser(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    if (user.status === 'DISABLED') {
      return reply.status(403).send({ error: 'Account is disabled' });
    }

    if (user.status === 'DELETED') {
      return reply.status(403).send({ error: 'Account has been deleted' });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
    }, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: toPublicUser(user),
    };
  }

  /**
   * Returns the authenticated user's public profile from the database.
   */
  async function getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as UserRow | undefined;
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return reply.status(403).send({ error: user.status === 'DISABLED' ? 'Account is disabled' : 'Account has been deleted' });
    }

    return toPublicUser(user);
  }

  /**
   * Updates the authenticated user's display profile fields and returns the refreshed profile.
   */
  async function updateProfile(request: FastifyRequest<{ Body: UpdateProfileBody }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    const nickname = normalizeNullableText(request.body.nickname);
    const avatarUrl = normalizeNullableText(request.body.avatarUrl);

    if (nickname && nickname.length > 40) {
      return reply.status(400).send({ error: 'Nickname must be 40 characters or fewer' });
    }

    if (avatarUrl && avatarUrl.length > 2048) {
      return reply.status(400).send({ error: 'Avatar URL must be 2048 characters or fewer' });
    }

    if (avatarUrl && !isHttpUrl(avatarUrl)) {
      return reply.status(400).send({ error: 'Avatar URL must start with http:// or https://' });
    }

    db.prepare('UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?').run(nickname, avatarUrl, authUser.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as UserRow | undefined;
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return toPublicUser(user);
  }

  /**
   * Replaces the authenticated user's password after verifying the current password.
   */
  async function changePassword(request: FastifyRequest<{ Body: ChangePasswordBody }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return reply.status(400).send({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return reply.status(400).send({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as UserRow | undefined;
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return reply.status(401).send({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, authUser.id);

    return { success: true };
  }

  /**
   * Converts a database user row into the public user shape used by the client.
   */
  function toPublicUser(user: UserRow) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname ?? '',
      avatarUrl: user.avatar_url ?? '',
    };
  }

  /**
   * Trims optional text fields and stores empty values as null.
   */
  function normalizeNullableText(value: string | null | undefined) {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  /**
   * Accepts only absolute HTTP(S) URLs for externally hosted avatar images.
   */
  function isHttpUrl(value: string) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
};
