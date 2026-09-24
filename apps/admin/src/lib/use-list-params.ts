'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Page et filtres d'une liste, conservés dans l'URL (lien partageable, retour
 * arrière du navigateur). Changer un filtre revient à la page 1.
 */
export function useListParams<K extends string>(keys: readonly K[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const filters = Object.fromEntries(keys.map((key) => [key, searchParams.get(key) ?? ''])) as Record<K, string>;

  const update = useCallback(
    (changes: Partial<Record<K | 'page', string>>) => {
      const next = new URLSearchParams(searchParams.toString());
      if (!('page' in changes)) {
        next.delete('page');
      }
      for (const [key, value] of Object.entries(changes) as [string, string | undefined][]) {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, router, pathname],
  );

  /** Filtres non vides, prêts à passer en paramètres d'API. */
  const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')) as Partial<Record<K, string>>;

  return { page, filters, query, update };
}
