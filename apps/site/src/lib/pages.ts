import { twigDate } from './dates';
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

/** "now"|date("d/m/Y") (jour du serveur, fuseau de production). */
export function today(): string {
  return twigDate('now', 'd/m/Y');
}

/** Filtre striptags de Twig (strip_tags de PHP). */
export function stripTags(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?[a-zA-Z!?][^>]*>/g, '');
}

/** strcasecmp de PHP : comparaison d'octets, seules les majuscules ASCII rabattues. */
export function strcasecmp(a: string, b: string): number {
  const lower = (s: string) => Buffer.from(s.replace(/[A-Z]/g, (c) => c.toLowerCase()), 'utf8');
  return Buffer.compare(lower(a), lower(b));
}

/** Liens sociaux (réseau → URL) dans l'ordre saisi ; vide si absents ({% if member.socialLinks %}). */
export function socialLinks(links: unknown): [string, string][] {
  return links && typeof links === 'object' && !Array.isArray(links) ? Object.entries(links as Record<string, string>) : [];
}
