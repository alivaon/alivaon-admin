import type { ReactNode } from 'react';
import { absoluteUrl, asset, CANONICAL_ORIGIN } from '@/lib/config';
import { trans, type Locale } from '@/i18n/translator';

const OG_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

export interface SeoProps {
  locale: Locale;
  /** Chemin de la page (pathInfo, sans query string). */
  pathname: string;
  alternates: Partial<Record<Locale, string>>;
  title?: string;
  description?: string;
  robots?: string;
  /** Bloc canonical_url ; défaut : https://www.alivaon.com + pathInfo. */
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  /** Chaîne vide : balise omise (comme un bloc Twig vide). */
  ogImageType?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  twitterCard?: string;
  /** Bloc head_extra (JSON-LD…). */
  extra?: ReactNode;
}

/**
 * Balises SEO du <head> de base.html.twig, bloc par bloc (mêmes défauts).
 * Rendues depuis la page : React les place dans le <head> du document.
 */
export function Seo(props: SeoProps) {
  const { locale, alternates } = props;
  const title = props.title ?? trans(locale, 'base.default_title');
  const description = props.description ?? trans(locale, 'base.default_meta');
  const canonical = (props.canonical ?? `${CANONICAL_ORIGIN}${props.pathname}`).trim();
  const ogTitle = props.ogTitle ?? title;
  const ogDescription = props.ogDescription ?? description;
  const ogImage = (props.ogImage ?? absoluteUrl(asset('build/images/og/og-default.png'))).trim();
  const ogImageAlt = (props.ogImageAlt ?? ogTitle).trim();
  const ogImageType = (props.ogImageType ?? 'image/jpeg').trim();
  const ogImageWidth = (props.ogImageWidth ?? '1200').trim();
  const ogImageHeight = (props.ogImageHeight ?? '630').trim();
  const locales = Object.keys(alternates) as Locale[];
  const ogAlternates = locales.length > 1 ? locales.filter((l) => l !== locale) : [];

  return (
    <>
      <meta name="description" content={description} />{' '}<meta name="robots" content={props.robots ?? 'index, follow'} />{' '}<title>{title}</title>{' '}<meta property="og:type" content={props.ogType ?? 'website'} />{' '}<meta property="og:site_name" content="Alivaon" />{' '}<meta property="og:title" content={ogTitle} />{' '}<meta property="og:description" content={ogDescription} />{' '}<meta property="og:url" content={canonical} />{' '}<meta property="og:locale" content={OG_LOCALES[locale]} />{' '}{ogAlternates.map((alt) => (
        <meta key={alt} property="og:locale:alternate" content={OG_LOCALES[alt]} />
      ))}{' '}<meta property="og:image" content={ogImage} />{' '}<meta property="og:image:secure_url" content={ogImage} />{' '}<meta property="og:image:alt" content={ogImageAlt} />{' '}{ogImageType && <meta property="og:image:type" content={ogImageType} />}{' '}{ogImageWidth && <meta property="og:image:width" content={ogImageWidth} />}{' '}{ogImageHeight && <meta property="og:image:height" content={ogImageHeight} />}{' '}<meta name="twitter:card" content={props.twitterCard ?? 'summary_large_image'} />{' '}<meta name="twitter:title" content={ogTitle} />{' '}<meta name="twitter:description" content={ogDescription} />{' '}<meta name="twitter:image" content={ogImage} />{' '}<meta name="twitter:image:alt" content={ogImageAlt} />{' '}<link rel="canonical" href={canonical} />{' '}{/* _partials/_hreflang.html.twig : seulement s'il existe une autre version ; x-default = FR. */}{' '}{locales.length > 1 &&
        locales.map((l) => <link key={l} rel="alternate" hrefLang={l} href={alternates[l]} />)}{' '}{locales.length > 1 && alternates.fr && <link rel="alternate" hrefLang="x-default" href={alternates.fr} />}{' '}{props.extra}
    </>
  );
}
