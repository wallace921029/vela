import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useNavData } from '@/hooks/useNavData';
import type { NavGroup, NavItem } from '@/types';
import { getFirstValidationError } from '@/utils/validation';
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FolderPlus,
  ArrowDownAZ,
  ArrowUpZA,
  ListOrdered,
  LayoutGrid,
  Search,
  X,
  CheckSquare,
  FolderOutput,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';

import { FaviconImage } from './FaviconImage';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sortable Dialog Item
const SortableGridItem = ({ id, index, name }: { id: string, index: number, name: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.8 : 1 };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing bg-white dark:bg-neutral-900 ${isDragging ? 'border-primary ring-1 ring-primary shadow-lg' : 'border-neutral-200 dark:border-neutral-800 hover:border-primary/50 transition-colors'}`}
    >
      <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-500">
        {index + 1}
      </div>
      <span className="text-sm font-medium truncate">{name}</span>
    </div>
  );
};

// Reusable Sort Dialog Component
const SortDialog = ({ open, onOpenChange, title, items, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: { id: string, name: string }[];
  onSave: (orderedIds: string[]) => void;
}) => {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [localItems, setLocalItems] = useState(items);
  
  useEffect(() => { 
    if (open) {
      setLocalItems(items);
    }
  }, [items, open]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = localItems.findIndex(i => i.id === active.id);
      const newIndex = localItems.findIndex(i => i.id === over?.id);
      setLocalItems(arrayMove(localItems, oldIndex, newIndex));
    }
  };

  const handleSave = () => {
    onSave(localItems.map(i => i.id));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1 pb-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localItems.map(i => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {localItems.map((item, index) => (
                  <SortableGridItem key={item.id} id={item.id} index={index} name={item.name} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full sm:w-auto px-8">
            {t('nav.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


type CardSize = 'small' | 'medium' | 'large';
type DeleteTarget =
  | { type: 'group'; groupId: string; title: string; itemCount: number }
  | { type: 'item'; groupId: string; itemId: string; title: string }
  | { type: 'batch'; count: number };

const CARD_SIZE_STYLES: Record<CardSize, { card: string; icon: string; title: string; desc: string; gap: string }> = {
  small: { card: 'h-[52px] p-2 rounded-lg', icon: 'w-6 h-6 rounded-md', title: 'text-xs', desc: 'text-[9px]', gap: 'gap-2' },
  medium: { card: 'h-[68px] p-3 rounded-xl', icon: 'w-8 h-8 rounded-lg', title: 'text-sm', desc: 'text-[10px]', gap: 'gap-3' },
  large: { card: 'h-[88px] p-4 rounded-xl', icon: 'w-10 h-10 rounded-lg', title: 'text-base', desc: 'text-xs', gap: 'gap-4' },
};

const GRID_COLS: Record<CardSize, string> = {
  small: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6',
  medium: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  large: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// Static Item Component
const ItemCard = ({ 
  item, 
  groupId, 
  onEdit, 
  onDelete,
  onMove,
  cardSize = 'medium',
  isBatchMode = false,
  isSelected = false,
  onToggleSelect
}: { 
  item: NavItem; 
  groupId: string; 
  onEdit: (groupId: string, item: NavItem) => void; 
  onDelete: (groupId: string, itemId: string) => void;
  onMove: (groupId: string, item: NavItem) => void;
  cardSize?: CardSize;
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (groupId: string, itemId: string) => void;
}) => {
  const { t } = useTranslation();
  const s = CARD_SIZE_STYLES[cardSize];
  const [navTarget, setNavTarget] = useState<'_blank' | '_self'>('_blank');

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setNavTarget((localStorage.getItem('vela_nav_target') as '_blank' | '_self') || '_blank');
    };
    handleSettingsUpdate();
    window.addEventListener('vela_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('vela_settings_updated', handleSettingsUpdate);
  }, []);

  return (
    <div 
      className={`group relative flex items-center bg-white dark:bg-neutral-900 border transition-all duration-300 ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5'} ${s.card}`}
    >
      {isBatchMode && (
        <div 
          className="absolute top-2 left-2 z-10" 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.(groupId, item.id);
          }}
        >
          <Checkbox checked={isSelected} className="bg-white/80 dark:bg-neutral-900/80 data-[state=checked]:bg-primary" />
        </div>
      )}

      <a 
        href={item.url} 
        target={navTarget}
        rel="noreferrer"
        onClick={(e) => {
          if (isBatchMode) {
            e.preventDefault();
            onToggleSelect?.(groupId, item.id);
          }
        }}
        className={`flex items-center flex-1 outline-none min-w-0 ${s.gap} ${isBatchMode ? 'cursor-pointer pl-6' : ''}`}
      >
        <div className={`shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm ${s.icon}`}>
          <FaviconImage src={item.icon || ''} title={item.title} url={item.url} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-primary transition-colors ${s.title}`}>
            {item.title}
          </h4>
          <p className={`text-neutral-500 dark:text-neutral-400 mt-0.5 truncate ${s.desc}`}>
            {item.description || new URL(item.url).hostname}
          </p>
        </div>
      </a>

      {!isBatchMode && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <MoreVertical className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(groupId, item); }}>
                <FolderOutput className="mr-2 size-4" /> {t('nav.moveTo')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(groupId, item); }}>
                <Pencil className="mr-2 size-4" /> {t('nav.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(groupId, item.id); }}
              >
                <Trash2 className="mr-2 size-4" /> {t('nav.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

// Static Group Component
const GroupBlock = ({ 
  group,
  onEditGroup, 
  onDeleteGroup, 
  onOpenItemDialog, 
  onEditItem, 
  onDeleteItem,
  onMoveItem,
  onSortItems,
  onOpenCustomSort,
  cardSize = 'medium',
  isBatchMode = false,
  selectedItems = [],
  onToggleSelect
}: { 
  group: NavGroup; 
  onEditGroup: (g: NavGroup) => void; 
  onDeleteGroup: (id: string) => void;
  onOpenItemDialog: (id: string) => void;
  onEditItem: (groupId: string, item: NavItem) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
  onMoveItem: (groupId: string, item: NavItem) => void;
  onSortItems: (groupId: string, direction: 'asc' | 'desc') => void;
  onOpenCustomSort: (groupId: string) => void;
  cardSize?: CardSize;
  isBatchMode?: boolean;
  selectedItems?: {groupId: string, itemId: string}[];
  onToggleSelect?: (groupId: string, itemId: string) => void;
}) => {
  const { t } = useTranslation();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleToggleSort = () => {
    const newDir = sortDir === 'asc' ? 'desc' : 'asc';
    setSortDir(newDir);
    onSortItems(group.id, newDir);
  };

  return (
    <div id={`group-${group.id}`} className="space-y-4 rounded-2xl scroll-mt-24" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
      <div className="flex items-center group/header">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 text-lg">
            {group.title}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {group.items.length}
            </span>
          </h3>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity ml-4">
          <Button variant="ghost" size="icon" onClick={() => onOpenItemDialog(group.id)} className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" title={t('nav.addNav')}>
            <Plus className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleToggleSort} className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100" title="A-Z / Z-A">
            {sortDir === 'asc' ? <ArrowDownAZ className="size-4" /> : <ArrowUpZA className="size-4" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => onOpenCustomSort(group.id)} className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100" title={t('nav.customSort')}>
            <ListOrdered className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => onEditGroup(group)} className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100" title={t('nav.editGroup')}>
            <Pencil className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => onDeleteGroup(group.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title={t('nav.deleteGroup')}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className={`grid gap-3 md:gap-4 ${GRID_COLS[cardSize]}`}>
        {group.items.map((item) => (
          <ItemCard 
            key={item.id} 
            item={item} 
            groupId={group.id} 
            onEdit={onEditItem} 
            onDelete={onDeleteItem}
            onMove={onMoveItem}
            cardSize={cardSize}
            isBatchMode={isBatchMode}
            isSelected={selectedItems.some(s => s.groupId === group.id && s.itemId === item.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
};


const NavModule = () => {
  const { t } = useTranslation();
  const { 
    groups, 
    isLoaded,
    addGroup, 
    updateGroup, 
    deleteGroup, 
    addItem, 
    updateItem, 
    deleteItem,
    reorderAllGroups,
    reorderAllItems,
    sortGroups,
    sortItems,
    moveItem,
    moveItems,
    deleteItems
  } = useNavData();

  const [groupSortDir, setGroupSortDir] = useState<'asc' | 'desc'>('asc');
  const [cardSize, setCardSize] = useState<CardSize>(() => {
    return (localStorage.getItem('vela_card_size') as CardSize) || 'medium';
  });
  
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<NavGroup | null>(null);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupError, setGroupError] = useState('');

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{groupId: string, item: NavItem | null} | null>(null);
  const [itemData, setItemData] = useState({ title: '', url: '', icon: '', description: '' });
  const [itemError, setItemError] = useState('');

  // Dialog State for custom sort
  const [customSortGroupOpen, setCustomSortGroupOpen] = useState(false);
  const [customSortItemOpenFor, setCustomSortItemOpenFor] = useState<string | null>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Batch state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{groupId: string, itemId: string}[]>([]);
  const [showMoreOps, setShowMoreOps] = useState(false);

  // Move state
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{groupId: string, itemId: string} | null>(null);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string>('');

  if (!isLoaded) {
    return <div className="flex justify-center py-20 text-neutral-400">Loading...</div>;
  }

  const handleOpenGroupDialog = (group?: NavGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupTitle(group.title);
    } else {
      setEditingGroup(null);
      setGroupTitle('');
    }
    setGroupError('');
    setGroupDialogOpen(true);
  };

  const handleSaveGroup = () => {
    const result = z.object({
      title: z.string().trim().min(1, t('validation.groupTitle')),
    }).safeParse({ title: groupTitle });

    if (!result.success) {
      setGroupError(getFirstValidationError(result.error, t('validation.required')));
      return;
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, result.data.title);
    } else {
      addGroup(result.data.title);
    }
    setGroupDialogOpen(false);
  };

  const handleOpenItemDialog = (groupId: string, item?: NavItem) => {
    if (item) {
      setEditingItem({ groupId, item });
      setItemData({ title: item.title, url: item.url, icon: item.icon || '', description: item.description || '' });
    } else {
      setEditingItem({ groupId, item: null });
      setItemData({ title: '', url: '', icon: '', description: '' });
    }
    setItemError('');
    setItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    const result = z.object({
      title: z.string().trim().min(1, t('validation.itemTitle')),
      url: z.string().trim().url(t('validation.url')),
      icon: z.string().trim().refine((value) => !value || /^https?:\/\//i.test(value), t('validation.url')),
      description: z.string().trim(),
    }).safeParse(itemData);

    if (!result.success) {
      setItemError(getFirstValidationError(result.error, t('validation.required')));
      return;
    }

    if (editingItem?.item) {
      updateItem(editingItem.groupId, editingItem.item.id, result.data);
    } else if (editingItem) {
      addItem(editingItem.groupId, result.data);
    }
    setItemDialogOpen(false);
  };

  const handleRequestDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    setDeleteTarget({ type: 'group', groupId, title: group.title, itemCount: group.items.length });
  };

  const handleRequestDeleteItem = (groupId: string, itemId: string) => {
    const item = groups.find(g => g.id === groupId)?.items.find(i => i.id === itemId);
    if (!item) return;
    setDeleteTarget({ type: 'item', groupId, itemId, title: item.title });
  };

  const handleToggleSelect = (groupId: string, itemId: string) => {
    setSelectedItems(prev => {
      const exists = prev.some(s => s.groupId === groupId && s.itemId === itemId);
      if (exists) {
        return prev.filter(s => !(s.groupId === groupId && s.itemId === itemId));
      }
      return [...prev, {groupId, itemId}];
    });
  };

  const handleOpenMoveDialog = (groupId?: string, item?: NavItem) => {
    if (groupId && item) {
      setMoveTarget({groupId, itemId: item.id});
    } else {
      setMoveTarget(null); // batch
    }
    setSelectedTargetGroup('');
    setMoveDialogOpen(true);
  };

  const handleConfirmMove = () => {
    if (!selectedTargetGroup) return;
    if (moveTarget) {
      moveItem(moveTarget.groupId, selectedTargetGroup, moveTarget.itemId);
    } else {
      moveItems(selectedItems, selectedTargetGroup);
      setSelectedItems([]);
      setIsBatchMode(false);
    }
    setMoveDialogOpen(false);
  };

  const handleRequestBatchDelete = () => {
    setDeleteTarget({ type: 'batch', count: selectedItems.length });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'group') {
      deleteGroup(deleteTarget.groupId);
    } else if (deleteTarget.type === 'item') {
      deleteItem(deleteTarget.groupId, deleteTarget.itemId);
    } else if (deleteTarget.type === 'batch') {
      deleteItems(selectedItems);
      setSelectedItems([]);
      setIsBatchMode(false);
    }

    setDeleteTarget(null);
  };

  const handleToggleGlobalSort = () => {
    const newDir = groupSortDir === 'asc' ? 'desc' : 'asc';
    setGroupSortDir(newDir);
    sortGroups(newDir);
  };

  const handleToggleCardSize = () => {
    const order: CardSize[] = ['small', 'medium', 'large'];
    const nextIdx = (order.indexOf(cardSize) + 1) % order.length;
    const next = order[nextIdx];
    setCardSize(next);
    localStorage.setItem('vela_card_size', next);
  };

  const cardSizeLabel: Record<CardSize, string> = { small: 'S', medium: 'M', large: 'L' };

  const currentSortItemGroup = groups.find(g => g.id === customSortItemOpenFor);

  // Filter groups by search query
  const filteredGroups = searchQuery.trim()
    ? groups.map(g => ({
        ...g,
        items: g.items.filter(item => {
          const q = searchQuery.toLowerCase();
          return item.title.toLowerCase().includes(q) 
            || item.url.toLowerCase().includes(q) 
            || (item.description || '').toLowerCase().includes(q);
        })
      })).filter(g => g.items.length > 0)
    : groups;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
      {/* Global Operations Bar */}
      <div className="flex justify-center items-center gap-2 px-2">
        {/* Search (always expanded, per requirements) */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-neutral-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('nav.searchPlaceholder')}
            className="h-8 pl-8 pr-8 w-48 rounded-full border-neutral-300 dark:border-neutral-700 shadow-sm text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        
        {/* New Group */}
        <Button variant="outline" size="icon" onClick={() => handleOpenGroupDialog()} className="h-8 w-8 rounded-full shadow-sm shrink-0" title={t('nav.newGroup')}>
          <FolderPlus className="size-3.5" />
        </Button>

        {/* More actions with slide animation */}
        <div className="relative flex items-center">
          <Button variant="outline" size="icon" onClick={() => setShowMoreOps(!showMoreOps)} className={`h-8 w-8 rounded-full shadow-sm shrink-0 z-20 relative transition-colors duration-200 ${showMoreOps ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`} title={t('nav.more')}>
            <MoreHorizontal className="size-3.5" />
          </Button>

          <div className={`absolute left-full top-0 h-full flex items-center gap-2 overflow-hidden transition-all duration-300 ease-out origin-left z-10 ${showMoreOps ? 'max-w-[600px] opacity-100 pl-2' : 'max-w-0 opacity-0 pointer-events-none'}`}>
            <Button variant="outline" size="icon" onClick={handleToggleCardSize} className="h-8 w-8 rounded-full shadow-sm relative shrink-0" title={`Card Size: ${cardSizeLabel[cardSize]}`}>
              <LayoutGrid className="size-3.5" />
              <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">{cardSizeLabel[cardSize]}</span>
            </Button>

            <Button variant="outline" size="icon" onClick={handleToggleGlobalSort} className="h-8 w-8 rounded-full shadow-sm shrink-0" title="A-Z / Z-A">
              {groupSortDir === 'asc' ? <ArrowDownAZ className="size-3.5" /> : <ArrowUpZA className="size-3.5" />}
            </Button>

            <Button variant="outline" size="icon" onClick={() => setCustomSortGroupOpen(true)} className="h-8 w-8 rounded-full shadow-sm shrink-0" title={t('nav.customSortGroups')}>
              <ListOrdered className="size-3.5" />
            </Button>

            {/* Toggle Batch Mode */}
            <Button variant={isBatchMode ? 'default' : 'outline'} size="icon" onClick={() => {
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) setSelectedItems([]); // clear on exit
            }} className="h-8 w-8 rounded-full shadow-sm shrink-0" title={t('nav.batchMode')}>
              <CheckSquare className="size-3.5" />
            </Button>

            {/* Batch Actions when isBatchMode && selectedItems > 0 */}
            {isBatchMode && selectedItems.length > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-200 border-l pl-2 ml-1 border-neutral-200 dark:border-neutral-800">
                <Button variant="outline" size="sm" onClick={() => handleOpenMoveDialog()} className="rounded-full shadow-sm h-8 text-xs px-3 shrink-0">
                  <FolderOutput className="size-3.5 mr-1.5" />
                  {t('nav.moveTo')}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleRequestBatchDelete()} className="rounded-full shadow-sm h-8 text-xs px-3 shrink-0">
                  <Trash2 className="size-3.5 mr-1.5" />
                  {t('nav.batchDelete')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content with optional sidebar index */}
      <div className={`grid gap-5 ${filteredGroups.length > 5 ? 'lg:grid-cols-[10rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)]' : ''}`}>
        {/* Left sidebar group index (when > 5 groups) */}
        {filteredGroups.length > 5 && (
          <aside className="hidden lg:block min-w-0">
            <nav className="sticky top-24 z-10 flex max-h-[calc(100vh-7rem)] w-full flex-col gap-1.5 overflow-y-auto rounded-lg border border-neutral-200/60 bg-white/55 p-2 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/45">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => document.getElementById(`group-${group.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="min-w-0 whitespace-normal break-words rounded-md px-2.5 py-1.5 text-left text-xs font-medium leading-snug text-neutral-500 transition-colors hover:bg-white/70 hover:text-primary dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-primary"
                  title={group.title}
                >
                  {group.title}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <div className="flex-1 min-w-0 space-y-10 pb-20">
          {filteredGroups.map((group) => (
            <GroupBlock 
              key={group.id} 
              group={group} 
              onEditGroup={handleOpenGroupDialog}
              onDeleteGroup={handleRequestDeleteGroup}
              onOpenItemDialog={handleOpenItemDialog}
              onEditItem={handleOpenItemDialog}
              onDeleteItem={handleRequestDeleteItem}
              onMoveItem={handleOpenMoveDialog}
              onSortItems={sortItems}
              onOpenCustomSort={setCustomSortItemOpenFor}
              cardSize={cardSize}
              isBatchMode={isBatchMode}
              selectedItems={selectedItems}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? t('nav.editGroup') : t('nav.newGroup')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {groupError && <p className="text-sm text-destructive">{groupError}</p>}
            <div className="grid gap-2">
              <Label htmlFor="group-title">{t('nav.groupName')}</Label>
              <Input 
                id="group-title" 
                value={groupTitle} 
                onChange={(e) => setGroupTitle(e.target.value)} 
                placeholder={t('nav.groupPlaceholder')}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGroup()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>{t('nav.cancel')}</Button>
            <Button onClick={handleSaveGroup}>{t('nav.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem?.item ? t('nav.edit') : t('nav.addNav')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {itemError && <p className="text-sm text-destructive">{itemError}</p>}
            <div className="grid gap-2">
              <Label htmlFor="item-title">{t('nav.itemTitle')} <span className="text-destructive">*</span></Label>
              <Input 
                id="item-title" 
                value={itemData.title} 
                onChange={(e) => setItemData({...itemData, title: e.target.value})} 
                placeholder={t('nav.itemTitlePlaceholder')} 
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-url">{t('nav.itemUrl')} <span className="text-destructive">*</span></Label>
              <Input 
                id="item-url" 
                type="url"
                value={itemData.url} 
                onChange={(e) => setItemData({...itemData, url: e.target.value})} 
                placeholder={t('nav.itemUrlPlaceholder')} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-icon">{t('nav.itemIcon')}</Label>
              <Input 
                id="item-icon" 
                value={itemData.icon} 
                onChange={(e) => setItemData({...itemData, icon: e.target.value})} 
                placeholder={t('nav.itemIconPlaceholder')} 
              />
              {itemData.url && !itemData.icon && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('nav.iconHint')}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-desc">{t('nav.itemDesc')}</Label>
              <Textarea 
                id="item-desc" 
                value={itemData.description} 
                onChange={(e) => setItemData({...itemData, description: e.target.value})} 
                placeholder={t('nav.itemDescPlaceholder')} 
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>{t('nav.cancel')}</Button>
            <Button onClick={handleSaveItem}>{t('nav.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('nav.selectTargetGroup')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedTargetGroup} onValueChange={setSelectedTargetGroup}>
              <SelectTrigger>
                <SelectValue placeholder={t('nav.selectGroupPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {groups.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>{t('nav.cancel')}</Button>
            <Button onClick={handleConfirmMove} disabled={!selectedTargetGroup}>{t('nav.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === 'group'
                ? t('nav.confirmDeleteGroupTitle')
                : deleteTarget?.type === 'item' 
                  ? t('nav.confirmDeleteItemTitle')
                  : t('nav.confirmBatchDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'group'
                ? t('nav.confirmDeleteGroupDesc', {
                    
                    title: deleteTarget.title,
                    count: deleteTarget.itemCount,
                  })
                : deleteTarget?.type === 'item'
                  ? t('nav.confirmDeleteItemDesc', {
                      
                      title: deleteTarget?.title,
                    })
                  : t('nav.confirmBatchDeleteDesc', {
                      
                      count: deleteTarget?.count,
                    })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              {t('nav.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SortDialog 
        open={customSortGroupOpen} 
        onOpenChange={setCustomSortGroupOpen}
        title={t('nav.customSortGroups')}
        items={groups.map(g => ({ id: g.id, name: g.title }))}
        onSave={reorderAllGroups}
      />

      {currentSortItemGroup && (
        <SortDialog 
          open={!!customSortItemOpenFor} 
          onOpenChange={(open) => !open && setCustomSortItemOpenFor(null)}
          title={`${currentSortItemGroup.title} - ${t('nav.customSort')}`}
          items={currentSortItemGroup.items.map(i => ({ id: i.id, name: i.title }))}
          onSave={(orderedIds) => reorderAllItems(currentSortItemGroup.id, orderedIds)}
        />
      )}
    </div>
  );
};

export default NavModule;
