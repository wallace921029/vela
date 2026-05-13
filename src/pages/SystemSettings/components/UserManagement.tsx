import { useEffect, useState } from 'react';
import { Pencil, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/contexts/AuthContext';
import TablePagination from './TablePagination';
import type { AdminUser, PaginatedResponse } from './types';
import { getFirstValidationError } from '@/utils/validation';

interface UserManagementProps {
  token: string | null;
}

const PAGE_SIZE = 20;

const UserManagement = ({ token }: UserManagementProps) => {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editedRole, setEditedRole] = useState<'ADMIN' | 'USER'>('USER');
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async (nextPage = page) => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
      });
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json() as PaginatedResponse<AdminUser> | { error?: string };

      if (!response.ok || !('items' in data)) {
        setError(t('system.errors.loadUsers'));
        return;
      }

      setUsers(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch {
      setError(t('system.errors.loadUsers'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page, token, t]);

  const formatDate = (value: string) => new Date(value).toLocaleDateString(
    i18n.language === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  const handleOpenEdit = (adminUser: AdminUser) => {
    setEditTarget(adminUser);
    setEditedRole(adminUser.role);
  };

  const updateUser = async (id: string, body: { role?: 'ADMIN' | 'USER'; status?: 'ACTIVE' | 'DISABLED' }) => {
    setError('');
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('system.errors.updateUser'));
        return null;
      }

      setUsers((current) => current.map((adminUser) => adminUser.id === id ? data : adminUser));
      return data as AdminUser;
    } catch {
      setError(t('system.errors.updateUser'));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRole = async () => {
    if (!editTarget) {
      return;
    }

    const result = z.object({
      role: z.enum(['USER', 'ADMIN']),
    }).safeParse({ role: editedRole });

    if (!result.success) {
      setError(getFirstValidationError(result.error, t('validation.required')));
      return;
    }

    const updatedUser = await updateUser(editTarget.id, result.data);
    if (updatedUser) {
      setEditTarget(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) {
      return;
    }

    const nextStatus = statusTarget.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    const updatedUser = await updateUser(statusTarget.id, { status: nextStatus });
    if (updatedUser) {
      setStatusTarget(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) {
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('system.errors.deleteUser'));
        return;
      }

      setDeleteTarget(null);
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadUsers(page);
      }
    } catch {
      setError(t('system.errors.deleteUser'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55">
      <CardHeader>
        <CardTitle>{t('system.users.title')}</CardTitle>
        <CardDescription>{t('system.users.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('system.users.email')}</TableHead>
              <TableHead>{t('system.users.nickname')}</TableHead>
              <TableHead>{t('system.users.role')}</TableHead>
              <TableHead>{t('system.users.status')}</TableHead>
              <TableHead>{t('system.users.createdAt')}</TableHead>
              <TableHead className="w-32 text-right">{t('system.users.actions')}</TableHead>
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
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {t('system.users.empty')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && users.map((adminUser) => {
              const isSelf = adminUser.id === currentUser?.id;

              return (
                <TableRow key={adminUser.id}>
                  <TableCell className="font-medium">{adminUser.email}</TableCell>
                  <TableCell>{adminUser.nickname || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={adminUser.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {t(`system.roles.${adminUser.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={adminUser.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {t(`system.status.${adminUser.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(adminUser.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {!isSelf && (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(adminUser)}
                          aria-label={t('system.users.editRole')}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setStatusTarget(adminUser)}
                          aria-label={adminUser.status === 'DISABLED' ? t('system.users.enable') : t('system.users.disable')}
                        >
                          {adminUser.status === 'DISABLED' ? <ShieldCheck className="size-4" /> : <ShieldOff className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(adminUser)}
                          aria-label={t('system.users.delete')}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />

        <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('system.users.editRole')}</DialogTitle>
              <DialogDescription>{editTarget?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="userRole">{t('system.users.role')}</Label>
              <Select value={editedRole} onValueChange={(value) => setEditedRole(value as 'ADMIN' | 'USER')}>
                <SelectTrigger id="userRole" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{t('system.roles.USER')}</SelectItem>
                  <SelectItem value="ADMIN">{t('system.roles.ADMIN')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveRole} disabled={isSaving}>
                {t('nav.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {statusTarget?.status === 'DISABLED' ? t('system.users.enableTitle') : t('system.users.disableTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {statusTarget?.status === 'DISABLED'
                  ? t('system.users.enableDescription', { email: statusTarget?.email })
                  : t('system.users.disableDescription', { email: statusTarget?.email })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleStatus} disabled={isSaving}>
                {statusTarget?.status === 'DISABLED' ? t('system.users.enable') : t('system.users.disable')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('system.users.deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('system.users.deleteDescription', { email: deleteTarget?.email })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDeleteUser} disabled={isSaving}>
                {t('system.users.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
