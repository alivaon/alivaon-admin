import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

/** Lignes de chargement, d'erreur ou de liste vide d'un tableau. */
export function TableState({ columns, isPending, error, empty, children }: { columns: number; isPending: boolean; error: Error | null; empty: boolean; children: ReactNode }) {
  if (isPending) {
    return Array.from({ length: 5 }, (_, i) => (
      <TableRow key={i}>
        <TableCell colSpan={columns}>
          <Skeleton className="h-5 w-full" />
        </TableCell>
      </TableRow>
    ));
  }
  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={columns}>
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </TableCell>
      </TableRow>
    );
  }
  if (empty) {
    return (
      <TableRow>
        <TableCell colSpan={columns} className="py-10 text-center text-muted-foreground">
          Aucun élément.
        </TableCell>
      </TableRow>
    );
  }

  return children;
}
