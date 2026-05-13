export interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'DISABLED';
  nickname: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface InviteCode {
  code: string;
  role: 'ADMIN' | 'USER';
  is_used: 0 | 1;
  used_by: string | null;
  used_by_email: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
