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

export type SearchParams = Record<string, string | string[] | undefined>;

/** Valeur simple d'un paramètre de query string (premier si répété). */
export function queryParam(params: SearchParams, name: string): string | undefined {
  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
}

/** $request->query->getInt('page', 1) pour les listes : entier ≥ 1 attendu. */
export function pageParam(params: SearchParams): number {
  const raw = queryParam(params, 'page');
  return raw !== undefined && /^\d+$/.test(raw) ? Number(raw) : 1;
}

/**
 * Échappement HTML automatique de Twig (stratégie html) : là où le gabarit
 * écrit « "{{ valeur }}" » dans un JSON-LD sans json_encode, la valeur publiée
 * contient les entités (&#039;, &amp;…). Reproduit tel quel.
 */
export function twigEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/** Filtre |slice de Twig sur une chaîne (mb_substr : en caractères). */
export function sliceChars(value: string, start: number, length: number): string {
  return Array.from(value).slice(start, start + length).join('');
}
