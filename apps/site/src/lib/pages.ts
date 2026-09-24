import { path, type RouteName } from '@/i18n/routes';
import { LOCALES, type Locale } from '@/i18n/translator';
import { absoluteUrl } from './config';

/**
 * AlternateUrls::forRoute : pages non liées à un contenu traduit (accueil,
 * listes, pages légales…), qui existent dans toutes les langues.
 */
export function staticAlternates(route: RouteName, params: Record<string, string> = {}): Partial<Record<Locale, string>> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, absoluteUrl(path(locale, route, params))]));
}

/** "now"|date("d/m/Y") */
export function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
