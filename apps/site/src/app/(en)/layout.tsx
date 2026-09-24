import type { ReactNode } from 'react';
import { SiteDocument } from '@/components/layout/site-document';

/** Racine des pages anglaises (/en) : <html lang="en">. */
export default function Layout({ children }: { children: ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
