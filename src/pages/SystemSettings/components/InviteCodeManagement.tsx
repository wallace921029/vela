import { useEffect, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TablePagination from './TablePagination';
import type { InviteCode, PaginatedResponse } from './types';
import { getFirstValidationError } from '@/utils/validation';
import request from '@/utils/request';

interface InviteCodeManagementProps {
  token: string | null;
}

const PAGE_SIZE = 20;

const InviteCodeManagement = ({ token: _token }: InviteCodeManagementProps) => {
  const { t } = useTranslation();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [count, setCount] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InviteCode | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedSet = new Set(selectedCodes);
  const allRowsSelected = invites.length > 0 && selectedCodes.length === invites.length;
  const someRowsSelected = selectedCodes.length > 0 && selectedCodes.length < invites.length;

  const loadInvites = async (nextPage = page) => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
      });
      const response = await request.get(`/api/admin/invites?${params.toString()}`);
      const data = response.data as PaginatedResponse<InviteCode> | { error?: string };

      if (!('items' in data)) {
        setError(t('system.errors.loadInvites'));
        return;
      }

      const nextInvites = data.items;
      setInvites(nextInvites);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
      setSelectedCodes((current) => current.filter((code) => nextInvites.some((invite) => invite.code === code)));
    } catch {
      setError(t('system.errors.loadInvites'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvites(page);
  }, [page]);

  const handleCreateInvite = async () => {
    const result = z.object({
      role: z.enum(['USER', 'ADMIN']),
      count: z.number().int().min(1, t('validation.inviteCount')).max(50, t('validation.inviteCount')),
    }).safeParse({ role, count });

    if (!result.success) {
      setError(getFirstValidationError(result.error, t('validation.required')));
      return;
    }

    setIsCreating(true);
    setError('');
    setMessage('');

    try {
      await request.post('/api/admin/invites', result.data);

      await loadInvites(page);
      setIsCreateOpen(false);
      setRole('USER');
      setCount(1);
    } catch {
      setError(t('system.errors.createInvite'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInvite = async () => {
    if (!deleteTarget) {
      return;
    }

    setError('');
    setMessage('');
    setIsDeleting(true);

    try {
      await request.delete(`/api/admin/invites/${encodeURIComponent(deleteTarget.code)}`);

      setDeleteTarget(null);
      if (invites.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadInvites(page);
      }
    } catch {
      setError(t('system.errors.deleteInvite'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteInvites = async () => {
    if (selectedCodes.length === 0) {
      return;
    }

    setError('');
    setMessage('');
    setIsDeleting(true);

    try {
      await request.post('/api/admin/invites/delete', { codes: selectedCodes });

      setIsBulkDeleteOpen(false);
      setSelectedCodes([]);
      if (selectedCodes.length >= invites.length && page > 1) {
        setPage(page - 1);
      } else {
        await loadInvites(page);
      }
    } catch {
      setError(t('system.errors.deleteInvite'));
    } finally {
      setIsDeleting(false);
    }
  };

  const copyInviteCodes = async (codes: string[]) => {
    if (codes.length === 0) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await navigator.clipboard.writeText(codes.join(', '));
      setMessage(t('system.invites.copied'));
    } catch {
      setError(t('system.errors.copyInvite'));
    }
  };

  const toggleInviteSelection = (code: string, checked: boolean | 'indeterminate') => {
    setSelectedCodes((current) => {
      if (checked) {
        return current.includes(code) ? current : [...current, code];
      }

      return current.filter((currentCode) => currentCode !== code);
    });
  };

  const toggleAllInvites = (checked: boolean | 'indeterminate') => {
    setSelectedCodes(checked ? invites.map((invite) => invite.code) : []);
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (open) {
      setRole('USER');
      setCount(1);
    }
  };

  return (
    <Card className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55">
      <CardHeader>
        <CardTitle>{t('system.invites.title')}</CardTitle>
        <CardDescription>{t('system.invites.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Dialog
            open={isCreateOpen}
            onOpenChange={handleCreateDialogChange}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" />
                {t('system.invites.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('system.invites.createDialogTitle')}</DialogTitle>
                <DialogDescription>{t('system.invites.createDialogDescription')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">{t('system.invites.role')}</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as 'USER' | 'ADMIN')}>
                    <SelectTrigger id="inviteRole" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">{t('system.roles.USER')}</SelectItem>
                      <SelectItem value="ADMIN">{t('system.roles.ADMIN')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteCount">{t('system.invites.count')}</Label>
                  <Input
                    id="inviteCount"
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(event) => setCount(Number(event.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateInvite} disabled={isCreating || count < 1 || count > 50}>
                  {isCreating ? t('system.invites.creating') : t('system.invites.createConfirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="outline"
            disabled={selectedCodes.length === 0}
            onClick={() => copyInviteCodes(selectedCodes)}
          >
            <Copy className="size-4" />
            {t('system.invites.bulkCopy')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={selectedCodes.length === 0}
            onClick={() => setIsBulkDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {t('system.invites.bulkDelete')}
          </Button>
          {selectedCodes.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {t('system.invites.selectedCount', { count: selectedCodes.length })}
            </span>
          )}
        </div>

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {message && <p className="mb-3 text-sm text-muted-foreground">{message}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allRowsSelected || (someRowsSelected ? 'indeterminate' : false)}
                  onCheckedChange={toggleAllInvites}
                  aria-label={t('system.invites.selectAll')}
                />
              </TableHead>
              <TableHead>{t('system.invites.code')}</TableHead>
              <TableHead>{t('system.invites.role')}</TableHead>
              <TableHead>{t('system.invites.status')}</TableHead>
              <TableHead>{t('system.invites.usedBy')}</TableHead>
              <TableHead className="w-16 text-right">{t('system.invites.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {t('system.loading')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && invites.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {t('system.invites.empty')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && invites.map((invite) => (
              <TableRow key={invite.code}>
                <TableCell>
                  <Checkbox
                    checked={selectedSet.has(invite.code)}
                    onCheckedChange={(checked) => toggleInviteSelection(invite.code, checked)}
                    aria-label={t('system.invites.selectCode', { code: invite.code })}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{invite.code}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyInviteCodes([invite.code])}
                      aria-label={t('system.invites.copyCode', { code: invite.code })}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{t(`system.roles.${invite.role}`)}</TableCell>
                <TableCell>
                  <Badge variant={invite.is_used ? 'secondary' : 'default'}>
                    {invite.is_used ? t('system.invites.used') : t('system.invites.available')}
                  </Badge>
                </TableCell>
                <TableCell>{invite.used_by_email || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(invite)}
                    aria-label={t('system.invites.delete')}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('system.invites.deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('system.invites.deleteDescription', { code: deleteTarget?.code })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDeleteInvite}>
                {t('system.invites.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('system.invites.bulkDeleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('system.invites.bulkDeleteDescription', { count: selectedCodes.length })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleBulkDeleteInvites}>
                {t('system.invites.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default InviteCodeManagement;
