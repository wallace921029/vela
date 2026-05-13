import type { NavGroup, NavItem } from '@/types';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const parseBookmarksHTML = (html: string): NavGroup[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const rootDl = doc.querySelector('dl');
  if (!rootDl) return [];

  const groups: NavGroup[] = [];

  const traverseDl = (dl: Element, currentFolderName?: string) => {
    // Array.from(dl.children) because Chrome DOMParser nests <DT> inside <DL>
    const dts = Array.from(dl.children).filter(el => el.tagName === 'DT');
    const elementsToProcess = dts.length > 0 ? dts : Array.from(dl.querySelectorAll(':scope > dt'));
    
    const items: NavItem[] = [];

    // First collect all direct links in this folder
    for (const dt of elementsToProcess) {
      const a = dt.querySelector('a');
      const nestedDl = dt.querySelector('dl');
      
      // If it has an 'a' tag and NO nested DL (meaning it's not a folder), it's a link
      if (a && !nestedDl) {
        items.push({
          id: generateId(),
          title: a.textContent || 'Untitled',
          url: a.getAttribute('href') || '',
          icon: a.getAttribute('icon') || '',
          description: ''
        });
      }
    }

    // If this folder has links, create a flat group for them
    if (items.length > 0) {
      let title = currentFolderName || '未分组';
      if (title === 'Bookmarks bar') {
        title = '书签栏';
      }
      
      groups.push({
        id: generateId(),
        title,
        items
      });
    }

    // Then traverse subfolders
    for (const dt of elementsToProcess) {
      const h3 = dt.querySelector('h3');
      const nestedDl = dt.querySelector('dl');
      
      if (h3 && nestedDl) {
        traverseDl(nestedDl, h3.textContent || 'Unnamed Folder');
      }
    }
  };

  traverseDl(rootDl);
  return groups;
};
