import type { ReactNode } from 'react';
import { SiteDocument } from '@/components/layout/site-document';

/**
 * Rendu à la requête, jamais au build (l’API n’y est pas joignable). Les
 * données restent dans le cache de fetch (tags + revalidate), voir lib/api.ts.
 */
export const dynamic = 'force-dynamic';

/** Racine des pages françaises (sans préfixe) : <html lang="fr">. */
export default function Layout({ children }: { children: ReactNode }) {
  return <SiteDocument locale="fr">{children}</SiteDocument>;
}
