import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

/** Liste de propriétés d'une fiche (libellé / valeur). */
export function DetailList({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-words">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}

/** Chargement ou erreur d'une fiche ; rend `children` une fois les données là. */
export function DetailState({ isPending, error, children }: { isPending: boolean; error: Error | null; children: () => ReactNode }) {
  if (isPending) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return children();
}
