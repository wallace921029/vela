import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  ArrowLeft,
  AlignJustify,
  LayoutList,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import TablePagination from '@/pages/SystemSettings/components/TablePagination';
import request from '@/utils/request';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface ListResponse {
  items: Note[];
  total: number;
  page: number;
  pageSize: number;
}

type EditorState = { id: string; title: string; content: string };
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type LayoutMode = 'compact' | 'comfortable';

const PAGE_SIZE = 20;
const LAYOUT_STORAGE_KEY = 'vela_notes_layout';

// authHeaders removed since request interceptor handles it

const Notes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    return localStorage.getItem(LAYOUT_STORAGE_KEY) === 'comfortable' ? 'comfortable' : 'compact';
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<EditorState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const isDirty =
    !!editor &&
    !!savedSnapshot &&
    editor.id === savedSnapshot.id &&
    (editor.title !== savedSnapshot.title || editor.content !== savedSnapshot.content);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsListLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (debouncedSearch) params.set('q', debouncedSearch);
        const res = await request.get(`/api/notes?${params.toString()}`);
        const data = res.data as ListResponse;
        if (cancelled) return;
        setNotes(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) toast.error(t('notes.loadFailed'));
      } finally {
        if (!cancelled) setIsListLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, reloadKey, t]);

  const refetchList = useCallback(() => setReloadKey((k) => k + 1), []);

  const openNoteInEditor = (note: Note) => {
    setSelectedId(note.id);
    const snapshot: EditorState = { id: note.id, title: note.title, content: note.content };
    setEditor(snapshot);
    setSavedSnapshot(snapshot);
    setSaveStatus('idle');
  };

  const closeEditor = () => {
    setSelectedId(null);
    setEditor(null);
    setSavedSnapshot(null);
    setSaveStatus('idle');
  };

  const handleSelect = (note: Note) => {
    if (note.id === selectedId) {
      // Toggle off — no prompt, discard local edits silently.
      closeEditor();
      return;
    }
    openNoteInEditor(note);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const updateEditor = (patch: Partial<EditorState>) => {
    if (!editor) return;
    setEditor({ ...editor, ...patch });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!editor || !isDirty) return;
    setSaveStatus('saving');
    try {
      const res = await request.patch(`/api/notes/${editor.id}`, { title: editor.title, content: editor.content });
      const updated = res.data as Note;
      setSavedSnapshot({ id: updated.id, title: updated.title, content: updated.content });
      setEditor({ id: updated.id, title: updated.title, content: updated.content });
      setNotes((prev) => {
        const next = prev.map((n) => (n.id === updated.id ? updated : n));
        next.sort((a, b) => b.updatedAt - a.updatedAt);
        return next;
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
      toast.error(t('notes.saveError'));
    }
  };

  const handleCancel = () => {
    if (!savedSnapshot) return;
    setEditor(savedSnapshot);
    setSaveStatus('idle');
  };

  const handleCreate = async () => {
    try {
      const res = await request.post('/api/notes', { title: '', content: '' });
      const created = res.data as Note;
      setSearchInput('');
      setPage(1);
      setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)]);
      setTotal((prev) => prev + 1);
      openNoteInEditor(created);
      window.setTimeout(() => titleInputRef.current?.focus(), 0);
    } catch {
      toast.error(t('notes.createFailed'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await request.delete(`/api/notes/${id}`);
      setDeleteTarget(null);
      if (selectedId === id) closeEditor();
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
      if (notes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetchList();
      }
      toast.success(t('notes.deleted'));
    } catch {
      toast.error(t('notes.deleteFailed'));
    }
  };

  const handleLayoutToggle = () => {
    const next: LayoutMode = layoutMode === 'compact' ? 'comfortable' : 'compact';
    setLayoutMode(next);
    localStorage.setItem(LAYOUT_STORAGE_KEY, next);
  };

  const derivedTitle = (note: Note) => {
    if (note.title) return note.title;
    const firstLine = note.content.split('\n').find((line) => line.trim().length > 0);
    return firstLine?.trim() || t('notes.untitled');
  };

  const derivedExcerpt = (note: Note) => {
    const trimmed = note.content.trim();
    if (!trimmed) return '';
    const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!note.title && lines.length > 0) lines.shift();
    return lines.join(' ').slice(0, 120);
  };

  const saveIndicator = useMemo(() => {
    if (!editor) return null;
    if (saveStatus === 'saved' && !isDirty) {
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="size-3 text-emerald-500" /> {t('notes.saved')}
        </span>
      );
    }
    if (saveStatus === 'error') {
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" /> {t('notes.saveError')}
        </span>
      );
    }
    if (isDirty) {
      return <span className="text-xs text-muted-foreground">{t('notes.unsaved')}</span>;
    }
    return null;
  }, [editor, saveStatus, isDirty, t]);

  const isComfortable = layoutMode === 'comfortable';

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-8">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">{t('notes.backToDashboard')}</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('notes.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('notes.description')}</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
        <aside className="flex min-h-0 flex-col rounded-xl border border-border bg-card/50 backdrop-blur md:w-80 md:shrink-0">
          <div className="flex items-center gap-1.5 border-b border-border/60 p-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('notes.searchPlaceholder')}
                className="h-9 pl-9"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLayoutToggle}
              aria-pressed={isComfortable}
              title={t(isComfortable ? 'notes.layoutToCompact' : 'notes.layoutToComfortable')}
              className="size-9 shrink-0"
            >
              {isComfortable ? <LayoutList className="size-4" /> : <AlignJustify className="size-4" />}
              <span className="sr-only">
                {t(isComfortable ? 'notes.layoutToCompact' : 'notes.layoutToComfortable')}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreate}
              title={t('notes.newNote')}
              className="size-9 shrink-0"
            >
              <Plus className="size-4" />
              <span className="sr-only">{t('notes.newNote')}</span>
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isListLoading && notes.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t('system.loading')}
              </div>
            ) : notes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <FileText className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">{t('notes.empty')}</p>
                <p className="text-xs text-muted-foreground">{t('notes.emptyDescription')}</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {notes.map((note) => {
                  const isActive = note.id === selectedId;
                  const excerpt = isComfortable ? derivedExcerpt(note) : '';
                  return (
                    <li key={note.id} className="group relative">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelect(note)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelect(note);
                          }
                        }}
                        className={
                          'flex w-full cursor-pointer flex-col gap-1 rounded-lg pr-9 text-left transition-colors ' +
                          (isComfortable ? 'p-3 ' : 'px-3 py-2 ') +
                          (isActive
                            ? 'bg-primary/10 ring-1 ring-primary/30'
                            : 'hover:bg-muted/60')
                        }
                      >
                        <span className="line-clamp-1 text-sm font-medium">{derivedTitle(note)}</span>
                        {isComfortable && excerpt && (
                          <span className="line-clamp-2 text-xs text-muted-foreground">{excerpt}</span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-1.5 top-1.5 size-7 rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                            aria-label={t('notes.itemActions')}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setDeleteTarget(note);
                            }}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            {t('notes.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {total > PAGE_SIZE && (
            <div className="border-t border-border px-3 pb-3">
              <TablePagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </div>
          )}
        </aside>

        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card/50 backdrop-blur">
          {editor ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <Input
                ref={titleInputRef}
                value={editor.title}
                onChange={(e) => updateEditor({ title: e.target.value })}
                placeholder={t('notes.titlePlaceholder')}
                className="h-10 rounded-md border-0 bg-muted/60 px-3 text-base font-semibold shadow-none transition-colors hover:bg-muted/80 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-muted/40 dark:hover:bg-muted/55 dark:focus-visible:bg-muted/70"
              />
              <Textarea
                value={editor.content}
                onChange={(e) => updateEditor({ content: e.target.value })}
                placeholder={t('notes.contentPlaceholder')}
                className="min-h-0 flex-1 resize-none rounded-md border-0 bg-muted/60 px-3 py-2 text-sm shadow-none transition-colors hover:bg-muted/80 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-muted/40 dark:hover:bg-muted/55 dark:focus-visible:bg-muted/70"
              />
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 pt-3">
                <div className="min-h-5">{saveIndicator}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={!isDirty || saveStatus === 'saving'}
                  >
                    {t('nav.cancel')}
                  </Button>
                  <Button onClick={handleSave} disabled={!isDirty || saveStatus === 'saving'}>
                    {saveStatus === 'saving' && <Loader2 className="size-4 animate-spin" />}
                    {t('nav.save')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <FileText className="size-10" />
              <p className="text-sm">{t('notes.editorEmpty')}</p>
            </div>
          )}
        </section>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('notes.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('notes.deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('notes.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notes;
