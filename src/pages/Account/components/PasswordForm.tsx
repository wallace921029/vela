import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirstValidationError } from '@/utils/validation';
import { getAccountErrorMessage } from './accountErrorMessages';
import request from '@/utils/request';

interface PasswordFormProps {
  token: string | null;
}

const PasswordForm = ({ token }: PasswordFormProps) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const result = z.object({
      currentPassword: z.string().min(1, t('validation.required')),
      newPassword: z.string().min(6, t('validation.passwordMin')),
      confirmPassword: z.string().min(1, t('validation.required')),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    }).safeParse({ currentPassword, newPassword, confirmPassword });

    if (!result.success) {
      setError(getFirstValidationError(result.error, t('validation.required')));
      return;
    }

    setIsSaving(true);

    try {
      await request.patch('/api/auth/password', {
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(t('account.messages.passwordUpdated'));
    } catch (err: any) {
      setError(getAccountErrorMessage(err.response?.data?.error, 'account.errors.passwordFailed', t));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55">
      <CardHeader>
        <CardTitle>{t('account.password.title')}</CardTitle>
        <CardDescription>{t('account.password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('account.password.current')}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('account.password.new')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('account.password.confirm')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSaving}>
            <KeyRound className="size-4" />
            {isSaving ? t('account.password.updating') : t('account.password.update')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordForm;
