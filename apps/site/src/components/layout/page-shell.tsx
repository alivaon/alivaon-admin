import type { ReactNode } from 'react';
import { asset, GA_MEASUREMENT_ID } from '@/lib/config';
import { encoreEntry, MAIN_JS, VENDOR_JS, VENDOR_JS_AFTER_ODOMETER } from '@/lib/theme';
import { Footer } from './footer';
import { Header } from './header';
import type { PageContext } from './page-context';
import { Seo, type SeoProps } from './seo';
import { Marquee, ScrollTop, SideToggle } from './side-toggle';
import { ThemeScripts, type ThemeScript } from './theme-scripts';

export interface PageShellProps {
  page: PageContext;
  seo: Omit<SeoProps, 'locale' | 'alternates'>;
  /** Bloc header_extra_class (ex. header-area-7 sur l'accueil). */
  headerClass?: string;
  /** Bloc body_attrs : fond de page propre à certaines pages. */
  bodyBackground?: string;
  marqueeItems?: string[];
  /** Bloc page_scripts : exécutés après le bundle Encore, avant main.js. */
  pageScripts?: ThemeScript[];
  children: ReactNode;
}

/** Corps de base.html.twig autour du bloc body. */
export async function PageShell({ page, seo, headerClass, bodyBackground, marqueeItems, pageScripts = [], children }: PageShellProps) {
  const app = await encoreEntry('app');
  const scripts: ThemeScript[] = [
    ...VENDOR_JS.map((src) => ({ src: asset(src) })),
    // Odometer : auto-init désactivée, compteurs pilotés par main.js.
    { inline: 'window.odometerOptions = { auto: false };' },
    ...VENDOR_JS_AFTER_ODOMETER.map((src) => ({ src: asset(src) })),
    ...app.js.map((src) => ({ src })),
    ...pageScripts,
    { src: asset(MAIN_JS) },
  ];

  return (
    <>
      <Seo locale={page.locale} alternates={page.alternates} {...seo} />
      {bodyBackground && <style>{`body{background:${bodyBackground};}`}</style>}

      <ScrollTop />
      <SideToggle page={page} />
      <Header page={page} extraClass={headerClass} />

      <div className="has-smooth" id="has_smooth"></div>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>{children}</main>
          <Marquee items={marqueeItems} />
          <Footer page={page} />
        </div>
      </div>

      <ThemeScripts scripts={scripts} />

      {/* Google Analytics : production uniquement (GA_MEASUREMENT_ID vide ailleurs). */}
      {GA_MEASUREMENT_ID && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`,
            }}
          />
        </>
      )}
    </>
  );
}

/** Données structurées (bloc head_extra). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
