import type { FastifyRequest } from 'fastify';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status?: string;
  nickname?: string | null;
  avatarUrl?: string | null;
}

export type AuthenticatedRequest = FastifyRequest & {
  user: AuthUser;
};

export interface InviteCodeRow {
  code: string;
  role: string;
  is_used: number;
  used_by?: string | null;
}

export interface UserRow {
  id: string;
  email: string;
  password: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED' | 'DELETED';
  nickname?: string | null;
  avatar_url?: string | null;
}

export interface GroupRow {
  id: string;
  title: string;
}

export interface ItemRow {
  id: string;
  group_id: string;
  url: string;
  icon?: string | null;
  title: string;
  description?: string | null;
}

export interface NavItemInput {
  id: string;
  url: string;
  icon?: string | null;
  title: string;
  description?: string | null;
}

export interface NavGroupInput {
  id: string;
  title: string;
  items?: NavItemInput[];
}
