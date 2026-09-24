import table from '@/generated/routes.json';
import type { Locale } from './translator';

export type RouteName = keyof typeof table.paths;

const PATHS = table.paths as Record<string, Partial<Record<Locale, string>>>;

/** Chemin d'une route pour une locale (équivalent de path() en Twig). */
export function path(locale: Locale, name: RouteName, params: Record<string, string> = {}): string {
  const pattern = PATHS[name]?.[locale] ?? PATHS[name]?.fr;
  if (!pattern) {
    throw new Error(`Route inconnue : ${name}`);
  }
  return pattern.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Paramètre manquant « ${key} » pour ${name}`);
    }
    return encodeURIComponent(value);
  });
}

export const REDIRECTS = table.redirects;
