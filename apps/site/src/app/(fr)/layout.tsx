import type { ReactNode } from 'react';
import { SiteDocument } from '@/components/layout/site-document';

/** Racine des pages françaises (sans préfixe) : <html lang="fr">. */
export default function Layout({ children }: { children: ReactNode }) {
  return <SiteDocument locale="fr">{children}</SiteDocument>;
}
