import { Ticket, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import ContentPageLayout, { ContentPageHeader } from '@/layouts/ContentPageLayout';

const SystemSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <ContentPageLayout>
        <Alert variant="destructive">
          <AlertTitle>{t('system.forbiddenTitle')}</AlertTitle>
          <AlertDescription>{t('system.forbiddenDescription')}</AlertDescription>
        </Alert>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout>
      <ContentPageHeader
        title={t('system.title')}
        description={t('system.description')}
        backLabel={t('system.backToDashboard')}
      />

      <div className="gap-5 md:grid md:grid-cols-[10rem_minmax(0,1fr)]">
        <nav className="mb-5 flex h-fit w-full flex-col gap-1 rounded-lg bg-white/60 p-1 shadow-sm backdrop-blur-md dark:bg-neutral-950/45 md:mb-0">
          <NavLink
            to="users"
            className={({ isActive }) => cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground dark:hover:bg-neutral-800/70',
              isActive && 'bg-background text-foreground shadow-sm dark:bg-input/30',
            )}
          >
            <Users className="size-4" />
            {t('system.modules.users')}
          </NavLink>
          <NavLink
            to="invites"
            className={({ isActive }) => cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground dark:hover:bg-neutral-800/70',
              isActive && 'bg-background text-foreground shadow-sm dark:bg-input/30',
            )}
          >
            <Ticket className="size-4" />
            {t('system.modules.invites')}
          </NavLink>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </ContentPageLayout>
  );
};

export default SystemSettings;
