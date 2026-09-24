import type { ReactNode } from 'react';
import { asset } from '@/lib/config';
import { encoreEntry, VENDOR_CSS } from '@/lib/theme';
import type { Locale } from '@/i18n/translator';

/**
 * Document HTML commun (<html>, <head> hors balises SEO de la page) de
 * base.html.twig. Les balises SEO propres à chaque page (<Seo>) sont placées
 * dans ce <head> par React.
 */
export async function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const app = await encoreEntry('app');

  return (
    <html lang={locale}>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" /><link rel="icon" type="image/x-icon" href={asset('build/images/logo/favicon.png')} />{VENDOR_CSS.map((href) => (
          <link key={href} rel="stylesheet" href={asset(href)} />
        ))}{app.css.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
