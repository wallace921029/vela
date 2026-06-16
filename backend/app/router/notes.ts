import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { db } from '../db.js';
import type { AuthUser, NoteRow } from '../types.js';

interface ListQuery {
  page?: string;
  pageSize?: string;
  q?: string;
}

interface CreateBody {
  title?: string | null;
  content?: string;
}

interface UpdateBody {
  title?: string | null;
  content?: string;
}

interface IdParams {
  id: string;
}

type NoteSummaryRow = Pick<NoteRow, 'id' | 'title' | 'created_at' | 'updated_at'>;

const MAX_TITLE = 200;
const MAX_CONTENT = 100_000;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const registerNotesRoutes = (fastify: FastifyInstance) => {
  const auth = { preValidation: [(fastify as any).authenticate] };

  fastify.get('/api/notes', auth, listNotes);
  fastify.get<{ Params: IdParams }>('/api/notes/:id', auth, getNote);
  fastify.post('/api/notes', auth, createNote);
  fastify.patch<{ Params: IdParams; Body: UpdateBody }>('/api/notes/:id', auth, updateNote);
  fastify.delete<{ Params: IdParams }>('/api/notes/:id', auth, deleteNote);

  /**
   * Lists the authenticated user's notes, optionally filtered by keyword in title or content.
   */
  async function listNotes(request: FastifyRequest<{ Querystring: ListQuery }>) {
    const userId = (request.user as AuthUser).id;
    const page = clampInt(parseInt(request.query.page ?? '1', 10), 1, Number.MAX_SAFE_INTEGER, 1);
    const pageSize = clampInt(parseInt(request.query.pageSize ?? `${DEFAULT_PAGE_SIZE}`, 10), 1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE);
    const q = (request.query.q ?? '').trim();

    const offset = (page - 1) * pageSize;
    const hasQuery = q.length > 0;
    const likeArg = hasQuery ? `%${escapeLike(q)}%` : null;

    let totalRow: { count: number };
    let rows: NoteSummaryRow[];

    if (hasQuery) {
      totalRow = db
        .prepare(
          `SELECT COUNT(*) AS count FROM notes
           WHERE user_id = ? AND (title LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\')`,
        )
        .get(userId, likeArg, likeArg) as { count: number };

      rows = db
        .prepare(
          `SELECT id, title, created_at, updated_at FROM notes
           WHERE user_id = ? AND (title LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\')
           ORDER BY updated_at DESC
           LIMIT ? OFFSET ?`,
        )
        .all(userId, likeArg, likeArg, pageSize, offset) as NoteSummaryRow[];
    } else {
      totalRow = db.prepare('SELECT COUNT(*) AS count FROM notes WHERE user_id = ?').get(userId) as { count: number };
      rows = db
        .prepare('SELECT id, title, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?')
        .all(userId, pageSize, offset) as NoteSummaryRow[];
    }

    return {
      items: rows.map(toPublicNoteSummary),
      total: totalRow.count,
      page,
      pageSize,
    };
  }

  /**
   * Returns one note with its content for the authenticated user.
   */
  async function getNote(request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
    const userId = (request.user as AuthUser).id;
    const { id } = request.params;
    const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, userId) as NoteRow | undefined;
    if (!row) {
      return reply.status(404).send({ error: 'Note not found' });
    }
    return toPublicNote(row);
  }

  /**
   * Creates an empty or pre-filled note owned by the authenticated user.
   */
  async function createNote(request: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
    const userId = (request.user as AuthUser).id;
    const title = normalizeTitle(request.body?.title);
    const content = normalizeContent(request.body?.content);

    if (title !== null && title.length > MAX_TITLE) {
      return reply.status(400).send({ error: `Title must be ${MAX_TITLE} characters or fewer` });
    }
    if (content.length > MAX_CONTENT) {
      return reply.status(400).send({ error: `Content must be ${MAX_CONTENT} characters or fewer` });
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    db.prepare('INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, userId, title, content, now, now);

    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow;
    return toPublicNote(row);
  }

  /**
   * Updates a note's title or content. Touches updated_at if any field is provided.
   */
  async function updateNote(request: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
    const userId = (request.user as AuthUser).id;
    const { id } = request.params;

    const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, userId) as NoteRow | undefined;
    if (!existing) {
      return reply.status(404).send({ error: 'Note not found' });
    }

    const fields: string[] = [];
    const args: unknown[] = [];

    if ('title' in request.body) {
      const title = normalizeTitle(request.body.title);
      if (title !== null && title.length > MAX_TITLE) {
        return reply.status(400).send({ error: `Title must be ${MAX_TITLE} characters or fewer` });
      }
      fields.push('title = ?');
      args.push(title);
    }

    if ('content' in request.body) {
      const content = normalizeContent(request.body.content);
      if (content.length > MAX_CONTENT) {
        return reply.status(400).send({ error: `Content must be ${MAX_CONTENT} characters or fewer` });
      }
      fields.push('content = ?');
      args.push(content);
    }

    if (fields.length === 0) {
      return toPublicNote(existing);
    }

    fields.push('updated_at = ?');
    args.push(Date.now());
    args.push(id, userId);

    db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...args);

    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow;
    return toPublicNote(row);
  }

  /**
   * Permanently deletes a note owned by the authenticated user.
   */
  async function deleteNote(request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
    const userId = (request.user as AuthUser).id;
    const { id } = request.params;
    const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) {
      return reply.status(404).send({ error: 'Note not found' });
    }
    return { success: true };
  }

  function toPublicNote(row: NoteRow) {
    return {
      id: row.id,
      title: row.title ?? '',
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function toPublicNoteSummary(row: NoteSummaryRow) {
    return {
      id: row.id,
      title: row.title ?? '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function normalizeTitle(value: string | null | undefined): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  function normalizeContent(value: string | undefined): string {
    return typeof value === 'string' ? value : '';
  }

  function clampInt(value: number, min: number, max: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, Math.floor(value)));
  }

  function escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (m) => `\\${m}`);
  }
};
