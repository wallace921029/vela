import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../db.js';
import type { AuthUser } from '../types.js';

export const registerAuthenticatePlugin = (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const authUser = request.user as AuthUser;
      if (typeof authUser.exp !== 'number') {
        return reply.status(401).send({ error: 'Authentication token is invalid or expired', code: 'AUTH_INVALID' });
      }

      const user = db.prepare('SELECT email, role, status, nickname, avatar_url FROM users WHERE id = ?').get(authUser.id) as {
        email: string;
        role: string;
        status: string;
        nickname?: string | null;
        avatar_url?: string | null;
      } | undefined;

      if (!user) {
        return reply.status(401).send({ error: 'User not found', code: 'AUTH_INVALID' });
      }

      if (user.status !== 'ACTIVE') {
        return reply.status(403).send({ error: user.status === 'DISABLED' ? 'Account is disabled' : 'Account has been deleted' });
      }

      request.user = {
        id: authUser.id,
        email: user.email,
        role: user.role,
        status: user.status,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
      };
    } catch {
      return reply.status(401).send({ error: 'Authentication token is invalid or expired', code: 'AUTH_INVALID' });
    }
  });
};
