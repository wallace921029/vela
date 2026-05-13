import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const TablePagination = ({ page, pageSize, total, onPageChange }: TablePaginationProps) => {
  const { t } = useTranslation();
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>{t('system.pagination.summary', { page, totalPages, total })}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          {t('system.pagination.previous')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('system.pagination.next')}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
