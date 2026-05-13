import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import PasswordForm from './components/PasswordForm';
import ProfileForm from './components/ProfileForm';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, user, updateUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-10">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">{t('account.backToDashboard')}</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('account.title')}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <ProfileForm token={token} user={user} onUserUpdate={updateUser} />
        <PasswordForm token={token} />
      </div>
    </div>
  );
};

export default AccountSettings;
