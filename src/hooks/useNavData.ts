import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { NavGroup, NavItem } from '@/types';
import request from '@/utils/request';

export const useNavData = () => {
  const [groups, setGroups] = useState<NavGroup[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vela_token');
        if (!token) {
          setIsLoaded(true);
          return;
        }

        const response = await request.get('/api/nav');
        setGroups(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token might be expired
          localStorage.removeItem('vela_token');
          localStorage.removeItem('vela_user');
          window.location.href = '/login';
        } else {
          console.error('Failed to fetch nav data:', error);
        }
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  const saveGroups = async (newGroups: NavGroup[]) => {
    // Optimistic UI update
    setGroups(newGroups);
    // Persist to SQLite backend
    try {
      const token = localStorage.getItem('vela_token');
      if (!token) return;

      await request.put('/api/nav', newGroups);
    } catch (e) {
      console.error('Failed to save nav data:', e);
    }
  };

  const addGroup = (title: string) => {
    const newGroup: NavGroup = { id: Date.now().toString(), title, items: [] };
    saveGroups([...groups, newGroup]);
  };

  const updateGroup = (id: string, title: string) => {
    saveGroups(groups.map(g => g.id === id ? { ...g, title } : g));
  };

  const deleteGroup = (id: string) => {
    saveGroups(groups.filter(g => g.id !== id));
  };

  const addItem = (groupId: string, item: Omit<NavItem, 'id'>) => {
    const newItem: NavItem = { ...item, id: Date.now().toString() };
    saveGroups(groups.map(g => g.id === groupId ? { ...g, items: [...g.items, newItem] } : g));
  };

  const updateItem = (groupId: string, itemId: string, item: Omit<NavItem, 'id'>) => {
    saveGroups(groups.map(g => g.id === groupId ? {
      ...g,
      items: g.items.map(i => i.id === itemId ? { ...i, ...item } : i)
    } : g));
  };

  const deleteItem = (groupId: string, itemId: string) => {
    saveGroups(groups.map(g => g.id === groupId ? {
      ...g,
      items: g.items.filter(i => i.id !== itemId)
    } : g));
  };

  const reorderGroups = (oldIndex: number, newIndex: number) => {
    saveGroups(arrayMove(groups, oldIndex, newIndex));
  };

  const reorderAllGroups = (orderedIds: string[]) => {
    const idToIndex = new Map(orderedIds.map((id, idx) => [id, idx]));
    saveGroups([...groups].sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0)));
  };

  const reorderItems = (groupId: string, oldIndex: number, newIndex: number) => {
    saveGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, items: arrayMove(g.items, oldIndex, newIndex) };
      }
      return g;
    }));
  };

  const reorderAllItems = (groupId: string, orderedIds: string[]) => {
    const idToIndex = new Map(orderedIds.map((id, idx) => [id, idx]));
    saveGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, items: [...g.items].sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0)) };
      }
      return g;
    }));
  };

  const sortItems = (groupId: string, direction: 'asc' | 'desc') => {
    saveGroups(groups.map(g => {
      if (g.id === groupId) {
        const sortedItems = [...g.items].sort((a, b) => {
          return direction === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        });
        return { ...g, items: sortedItems };
      }
      return g;
    }));
  };
  const sortGroups = (direction: 'asc' | 'desc') => {
    saveGroups([...groups].sort((a, b) => {
      return direction === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }));
  };

  const moveItem = (sourceGroupId: string, targetGroupId: string, itemId: string) => {
    if (sourceGroupId === targetGroupId) return;
    saveGroups(groups.map(g => {
      if (g.id === sourceGroupId) {
        return { ...g, items: g.items.filter(i => i.id !== itemId) };
      }
      if (g.id === targetGroupId) {
        const itemToMove = groups.find(src => src.id === sourceGroupId)?.items.find(i => i.id === itemId);
        return itemToMove ? { ...g, items: [...g.items, itemToMove] } : g;
      }
      return g;
    }));
  };

  const moveItems = (itemsToMove: { groupId: string, itemId: string }[], targetGroupId: string) => {
    let newGroups = [...groups];
    const itemsData = itemsToMove.map(loc => {
      const g = groups.find(g => g.id === loc.groupId);
      return g?.items.find(i => i.id === loc.itemId);
    }).filter(Boolean) as NavItem[];

    if (itemsData.length === 0) return;

    newGroups = newGroups.map(g => {
      const itemsToRemove = itemsToMove.filter(loc => loc.groupId === g.id).map(loc => loc.itemId);
      if (itemsToRemove.length > 0) {
        return { ...g, items: g.items.filter(i => !itemsToRemove.includes(i.id)) };
      }
      return g;
    });

    newGroups = newGroups.map(g => {
      if (g.id === targetGroupId) {
        return { ...g, items: [...g.items, ...itemsData] };
      }
      return g;
    });

    saveGroups(newGroups);
  };

  const deleteItems = (itemsToDelete: { groupId: string, itemId: string }[]) => {
    saveGroups(groups.map(g => {
      const itemsToRemove = itemsToDelete.filter(loc => loc.groupId === g.id).map(loc => loc.itemId);
      if (itemsToRemove.length > 0) {
        return { ...g, items: g.items.filter(i => !itemsToRemove.includes(i.id)) };
      }
      return g;
    }));
  };

  return {
    groups,
    isLoaded,
    addGroup,
    updateGroup,
    deleteGroup,
    addItem,
    updateItem,
    deleteItem,
    reorderGroups,
    reorderAllGroups,
    reorderItems,
    reorderAllItems,
    sortGroups,
    sortItems,
    moveItem,
    moveItems,
    deleteItems,
    setGroups: saveGroups
  };
};
