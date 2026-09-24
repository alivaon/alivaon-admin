import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

/**
 * Squelette provisoire. La mise en page réelle (thème, en-tête, pied de page,
 * locales fr/en) arrive en phase 4 ; d'ici là rien ne doit être indexé.
 */
export const metadata: Metadata = {
  title: 'Alivaon',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
