import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ContentPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

type ContentPageHeaderProps = {
  title?: ReactNode;
  description?: ReactNode;
  backLabel: string;
  children?: ReactNode;
  className?: string;
};

const ContentPageLayout = ({ children, className }: ContentPageLayoutProps) => (
  <div className={cn('mx-auto w-full max-w-[1000px] px-4 py-6 md:px-6 md:py-8', className)}>
    {children}
  </div>
);

export const ContentPageHeader = ({
  title,
  description,
  backLabel,
  children,
  className,
}: ContentPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn('mb-6 flex items-center gap-3', className)}>
      <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
        <ArrowLeft className="size-4" />
        <span className="sr-only">{backLabel}</span>
      </Button>
      {children ?? (
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
    </header>
  );
};

export default ContentPageLayout;
