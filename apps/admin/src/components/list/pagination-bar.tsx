'use client';

import { Button } from '@/components/ui/button';

export function PaginationBar({ page, total, perPage = 20, onPage }: { page: number; total: number; perPage?: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-4 text-sm text-muted-foreground">
      <span>
        {total} élément{total > 1 ? 's' : ''} — page {page} / {pages}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Précédent
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
