import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import ContentPageLayout, { ContentPageHeader } from '@/layouts/ContentPageLayout';
import PasswordForm from './components/PasswordForm';
import ProfileForm from './components/ProfileForm';

const AccountSettings = () => {
  const { t } = useTranslation();
  const { token, user, updateUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ContentPageLayout>
      <ContentPageHeader
        title={t('account.title')}
        description={user.email}
        backLabel={t('account.backToDashboard')}
      />

      <div className="grid gap-6">
        <ProfileForm token={token} user={user} onUserUpdate={updateUser} />
        <PasswordForm token={token} />
      </div>
    </ContentPageLayout>
  );
};

export default AccountSettings;
