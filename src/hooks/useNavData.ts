import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { NavGroup, NavItem } from '@/types';

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

        const response = await fetch('/api/nav', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setGroups(Array.isArray(data) ? data : []);
        } else if (response.status === 401) {
          // Token might be expired
          localStorage.removeItem('vela_token');
          localStorage.removeItem('vela_user');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to fetch nav data:', error);
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

      await fetch('/api/nav', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGroups)
      });
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
    setGroups: saveGroups
  };
};
