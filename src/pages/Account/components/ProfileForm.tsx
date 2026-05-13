import { useEffect, useState, type FormEvent } from 'react';
import { Save, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { User as AuthUser } from '@/contexts/AuthContext';
import { getFirstValidationError } from '@/utils/validation';
import { getAccountErrorMessage } from './accountErrorMessages';

interface ProfileFormProps {
  token: string | null;
  user: AuthUser;
  onUserUpdate: (user: AuthUser) => void;
}

const ProfileForm = ({ token, user, onUserUpdate }: ProfileFormProps) => {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState(user.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNickname(user.nickname || '');
    setAvatarUrl(user.avatarUrl || '');
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const result = z.object({
      nickname: z.string().trim().max(40, t('validation.nicknameMax')),
      avatarUrl: z.string().trim().refine((value) => {
        if (!value) {
          return true;
        }

        try {
          const parsed = new URL(value);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      }, t('validation.avatarUrl')),
    }).safeParse({ nickname, avatarUrl });

    if (!result.success) {
      setError(getFirstValidationError(result.error, t('validation.required')));
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(getAccountErrorMessage(data.error, 'account.errors.profileFailed', t));
        return;
      }

      onUserUpdate(data);
      setMessage(t('account.messages.profileUpdated'));
    } catch {
      setError(t('account.errors.profileFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg bg-white/70 shadow-sm backdrop-blur-md dark:bg-neutral-950/55">
      <CardHeader>
        <CardTitle>{t('account.profile.title')}</CardTitle>
        <CardDescription>{t('account.profile.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={nickname || user.email} />}
              <AvatarFallback>
                <User className="size-8" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">{t('account.profile.avatarUrl')}</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder={t('account.profile.avatarPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">{t('account.profile.nickname')}</Label>
            <Input
              id="nickname"
              value={nickname}
              maxLength={40}
              onChange={(event) => setNickname(event.target.value)}
              placeholder={t('account.profile.nicknamePlaceholder')}
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
            <Save className="size-4" />
            {isSaving ? t('account.profile.saving') : t('account.profile.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
