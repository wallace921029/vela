import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

const TablePagination = ({ page, pageSize, total, onPageChange, compact = false }: TablePaginationProps) => {
  const { t } = useTranslation();
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const previousLabel = t('system.pagination.previous');
  const nextLabel = t('system.pagination.next');

  return (
    <div className={compact ? 'mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground' : 'mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'}>
      {compact ? (
        <span className="whitespace-nowrap">P: {page}/{totalPages} T: {total}</span>
      ) : (
        <span>{t('system.pagination.summary', { page, totalPages, total })}</span>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={compact ? 'ghost' : 'outline'}
          size={compact ? 'icon' : 'sm'}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title={previousLabel}
          aria-label={previousLabel}
          className={compact ? 'size-8' : undefined}
        >
          <ChevronLeft className="size-4" />
          {!compact && previousLabel}
        </Button>
        <Button
          type="button"
          variant={compact ? 'ghost' : 'outline'}
          size={compact ? 'icon' : 'sm'}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title={nextLabel}
          aria-label={nextLabel}
          className={compact ? 'size-8' : undefined}
        >
          {!compact && nextLabel}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
