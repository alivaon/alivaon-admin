import type { RouteName } from '@/i18n/routes';
import type { Locale } from '@/i18n/translator';

/**
 * Contexte d'une page, passé aux composants communs (équivalent de
 * app.request et des variables de gabarit Twig).
 */
export interface PageContext {
  locale: Locale;
  /** Route courante, sans suffixe de locale (classe « active » du menu). */
  route: RouteName | null;
  /** Versions publiées de la page : {locale: URL absolue} (AlternateUrls). */
  alternates: Partial<Record<Locale, string>>;
}
