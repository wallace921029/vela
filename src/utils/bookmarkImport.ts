import type { NavGroup } from '@/types';
import { parseBookmarksHTML } from './bookmarkParser';
import request from './request';

export type BookmarkImportResult =
  | { ok: true; groups: NavGroup[] }
  | { ok: false; reason: 'empty' | 'missing-token' | 'save-failed' };

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(String(event.target?.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const importBookmarksFile = async (file: File, token: string | null): Promise<BookmarkImportResult> => {
  if (!token) {
    return { ok: false, reason: 'missing-token' };
  }

  const html = await readFileAsText(file);
  const groups = parseBookmarksHTML(html);

  if (groups.length === 0) {
    return { ok: false, reason: 'empty' };
  }

  try {
    await request.put('/api/nav', groups, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    return { ok: false, reason: 'save-failed' };
  }

  return { ok: true, groups };
};
