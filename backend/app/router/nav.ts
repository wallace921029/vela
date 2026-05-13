import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../db.js';
import type { AuthUser, GroupRow, ItemRow, NavGroupInput, NavItemInput } from '../types.js';

export const registerNavRoutes = (fastify: FastifyInstance) => {
  fastify.get('/api/nav', { preValidation: [(fastify as any).authenticate] }, getNavigation);
  fastify.put('/api/nav', { preValidation: [(fastify as any).authenticate] }, syncNavigation);

  /**
   * Returns all navigation groups and items owned by the authenticated user.
   */
  async function getNavigation(request: FastifyRequest) {
    const authUser = request.user as AuthUser;
    const userId = authUser.id;
    const groups = db.prepare('SELECT * FROM groups WHERE user_id = ? ORDER BY order_index ASC').all(userId) as GroupRow[];

    if (groups.length === 0) return [];

    const groupIds = groups.map((g) => `'${g.id}'`).join(',');
    const items = db.prepare(`SELECT * FROM items WHERE group_id IN (${groupIds}) ORDER BY order_index ASC`).all() as ItemRow[];

    return groups.map((group) => ({
      id: group.id,
      title: group.title,
      items: items
        .filter((item) => item.group_id === group.id)
        .map((item) => ({
          id: item.id,
          url: item.url,
          icon: item.icon || undefined,
          title: item.title,
          description: item.description || undefined,
        })),
    }));
  }

  /**
   * Replaces the authenticated user's full navigation tree in a single database transaction.
   */
  async function syncNavigation(request: FastifyRequest<{ Body: NavGroupInput[] }>, reply: FastifyReply) {
    const newGroups = request.body;
    const authUser = request.user as AuthUser;
    const userId = authUser.id;

    if (!Array.isArray(newGroups)) {
      return reply.status(400).send({ error: 'Body must be an array of groups' });
    }

    const insertGroup = db.prepare('INSERT INTO groups (id, user_id, title, order_index) VALUES (?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO items (id, group_id, url, icon, title, description, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const syncData = db.transaction((groupsToSync: NavGroupInput[]) => {
      const existingGroups = db.prepare('SELECT id FROM groups WHERE user_id = ?').all(userId) as GroupRow[];
      if (existingGroups.length > 0) {
        const groupIds = existingGroups.map((group) => `'${group.id}'`).join(',');
        db.prepare(`DELETE FROM items WHERE group_id IN (${groupIds})`).run();
        db.prepare('DELETE FROM groups WHERE user_id = ?').run(userId);
      }

      groupsToSync.forEach((group, groupIndex) => {
        insertGroup.run(group.id, userId, group.title, groupIndex);
        if (Array.isArray(group.items)) {
          group.items.forEach((item: NavItemInput, itemIndex: number) => {
            insertItem.run(
              item.id,
              group.id,
              item.url,
              item.icon || null,
              item.title,
              item.description || null,
              itemIndex,
            );
          });
        }
      });
    });

    syncData(newGroups);
    return { success: true };
  }
};
