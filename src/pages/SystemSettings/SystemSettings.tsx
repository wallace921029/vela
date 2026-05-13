import { ArrowLeft, Ticket, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const SystemSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-10">
        <Alert variant="destructive">
          <AlertTitle>{t('system.forbiddenTitle')}</AlertTitle>
          <AlertDescription>{t('system.forbiddenDescription')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">{t('system.backToDashboard')}</span>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('system.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('system.description')}</p>
        </div>
      </div>

      <div className="gap-5 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav className="mb-5 flex h-fit w-full flex-col gap-1 rounded-lg bg-white/60 p-1 shadow-sm backdrop-blur-md dark:bg-neutral-950/45 lg:mb-0">
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
    </div>
  );
};

export default SystemSettings;
