import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../db.js';
import type { AuthUser } from '../types.js';

interface CreateInviteBody {
  role?: 'ADMIN' | 'USER';
  count?: number;
}

interface InviteCodeParams {
  code: string;
}

interface UserParams {
  id: string;
}

interface UpdateUserBody {
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'DISABLED';
}

interface DeleteInvitesBody {
  codes?: string[];
}

interface PaginationQuery {
  page?: string;
  pageSize?: string;
}

export const registerAdminRoutes = (fastify: FastifyInstance) => {
  fastify.post('/api/admin/invites', { preValidation: [(fastify as any).authenticate] }, createInviteCode);
  fastify.get('/api/admin/invites', { preValidation: [(fastify as any).authenticate] }, listInviteCodes);
  fastify.post('/api/admin/invites/delete', { preValidation: [(fastify as any).authenticate] }, deleteInviteCodes);
  fastify.delete('/api/admin/invites/:code', { preValidation: [(fastify as any).authenticate] }, deleteInviteCode);
  fastify.get('/api/admin/users', { preValidation: [(fastify as any).authenticate] }, listUsers);
  fastify.patch('/api/admin/users/:id', { preValidation: [(fastify as any).authenticate] }, updateUser);
  fastify.delete('/api/admin/users/:id', { preValidation: [(fastify as any).authenticate] }, deleteUser);

  /**
   * Creates one or more invite codes for administrators, defaulting new codes to USER role.
   */
  async function createInviteCode(request: FastifyRequest<{ Body: CreateInviteBody }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const role = request.body.role === 'ADMIN' ? 'ADMIN' : 'USER';
    const count = normalizeInviteCount(request.body.count);
    if (!count) {
      return reply.status(400).send({ error: 'Invite count must be between 1 and 50' });
    }

    const codes = createUniqueInviteCodes(count);
    const insertInvite = db.prepare('INSERT INTO invite_codes (code, role) VALUES (?, ?)');
    const transaction = db.transaction(() => {
      codes.forEach((code) => insertInvite.run(code, role));
    });

    transaction();
    return { codes };
  }

  /**
   * Lists all invite codes for administrators.
   */
  async function listInviteCodes(request: FastifyRequest<{ Querystring: PaginationQuery }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const pagination = getPagination(request.query);
    const items = db.prepare(`
      SELECT invite_codes.code,
             invite_codes.role,
             invite_codes.is_used,
             invite_codes.used_by,
             users.email AS used_by_email
      FROM invite_codes
      LEFT JOIN users ON users.id = invite_codes.used_by
      ORDER BY invite_codes.is_used ASC, invite_codes.code ASC
      LIMIT ? OFFSET ?
    `).all(pagination.pageSize, pagination.offset);
    const total = db.prepare('SELECT COUNT(*) AS count FROM invite_codes').get() as { count: number };

    return {
      items,
      total: total.count,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * Deletes an invite code by code value for administrators.
   */
  async function deleteInviteCode(request: FastifyRequest<{ Params: InviteCodeParams }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const result = db.prepare('DELETE FROM invite_codes WHERE code = ?').run(request.params.code);
    if (result.changes === 0) {
      return reply.status(404).send({ error: 'Invite code not found' });
    }

    return { success: true };
  }

  /**
   * Deletes multiple invite codes in one administrator operation.
   */
  async function deleteInviteCodes(request: FastifyRequest<{ Body: DeleteInvitesBody }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const codes = Array.isArray(request.body.codes)
      ? Array.from(new Set(request.body.codes.filter((code) => typeof code === 'string' && code.trim())))
      : [];

    if (codes.length === 0) {
      return reply.status(400).send({ error: 'Invite codes are required' });
    }

    const deleteInvite = db.prepare('DELETE FROM invite_codes WHERE code = ?');
    const transaction = db.transaction(() => {
      codes.forEach((code) => deleteInvite.run(code));
    });

    transaction();
    return { success: true };
  }

  /**
   * Lists public user records for administrators.
   */
  async function listUsers(request: FastifyRequest<{ Querystring: PaginationQuery }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const pagination = getPagination(request.query);
    const items = db.prepare(`
      SELECT id, email, role, status, nickname, avatar_url, created_at
      FROM users
      WHERE status != 'DELETED'
      ORDER BY created_at DESC, email ASC
      LIMIT ? OFFSET ?
    `).all(pagination.pageSize, pagination.offset);
    const total = db.prepare("SELECT COUNT(*) AS count FROM users WHERE status != 'DELETED'").get() as { count: number };

    return {
      items,
      total: total.count,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * Updates another user's role or active/disabled status for administrators.
   */
  async function updateUser(request: FastifyRequest<{ Params: UserParams; Body: UpdateUserBody }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    if (request.params.id === authUser.id) {
      return reply.status(400).send({ error: 'You cannot modify your own account here' });
    }

    const target = db.prepare('SELECT id, status FROM users WHERE id = ?').get(request.params.id) as { id: string; status: string } | undefined;
    if (!target || target.status === 'DELETED') {
      return reply.status(404).send({ error: 'User not found' });
    }

    const role = request.body.role;
    const status = request.body.status;

    if (role && role !== 'ADMIN' && role !== 'USER') {
      return reply.status(400).send({ error: 'Invalid role' });
    }

    if (status && status !== 'ACTIVE' && status !== 'DISABLED') {
      return reply.status(400).send({ error: 'Invalid status' });
    }

    if (!role && !status) {
      return reply.status(400).send({ error: 'No changes provided' });
    }

    db.prepare(`
      UPDATE users
      SET role = COALESCE(?, role),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(role ?? null, status ?? null, request.params.id);

    return db.prepare('SELECT id, email, role, status, nickname, avatar_url, created_at FROM users WHERE id = ?').get(request.params.id);
  }

  /**
   * Soft-deletes another user so login can return a deleted-account message.
   */
  async function deleteUser(request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) {
    const authUser = request.user as AuthUser;
    if (authUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    if (request.params.id === authUser.id) {
      return reply.status(400).send({ error: 'You cannot delete your own account here' });
    }

    const result = db.prepare("UPDATE users SET status = 'DELETED' WHERE id = ? AND status != 'DELETED'").run(request.params.id);
    if (result.changes === 0) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return { success: true };
  }

  /**
   * Normalizes the requested invite count and limits bulk creation size.
   */
  function normalizeInviteCount(value: number | undefined) {
    const count = Number.isInteger(value) ? Number(value) : 1;
    return count >= 1 && count <= 50 ? count : null;
  }

  /**
   * Normalizes pagination query params and defaults page size to 20 rows.
   */
  function getPagination(query: PaginationQuery) {
    const page = Math.max(Number.parseInt(query.page || '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || '20', 10) || 20, 1), 100);

    return {
      page,
      pageSize,
      offset: (page - 1) * pageSize,
    };
  }

  /**
   * Generates an unused invite code with a compact uppercase token.
   */
  function createUniqueInviteCodes(count: number) {
    const codes = new Set<string>();

    while (codes.size < count) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      if (!codes.has(code) && !db.prepare('SELECT code FROM invite_codes WHERE code = ?').get(code)) {
        codes.add(code);
      }
    }

    return Array.from(codes);
  }
};
