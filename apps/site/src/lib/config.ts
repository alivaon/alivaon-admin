/**
 * Configuration du site (variables d'environnement du conteneur).
 * - SITE_ORIGIN : origine publique (https://www.alivaon.com en production) ;
 *   sert aux URLs absolues (alternates, og:image), comme l'hôte de la requête
 *   pour Symfony.
 * - API_INTERNAL_URL : Symfony sur le réseau interne (http://app).
 * - GA_MEASUREMENT_ID : Google Analytics, production uniquement.
 */
export const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? 'https://www.alivaon.com').replace(/\/$/, '');
export const API_INTERNAL_URL = (process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
export const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID ?? '';

/** Canonical : toujours le domaine de production, quel que soit l'environnement (base.html.twig). */
export const CANONICAL_ORIGIN = 'https://www.alivaon.com';

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

/** asset() de Twig : chemin public d'un fichier servi par Symfony (/build, /vandor). */
export function asset(path: string): string {
  return `/${path.replace(/^\//, '')}`;
}
