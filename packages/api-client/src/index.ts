import createClient, { type Client } from 'openapi-fetch';
import type { paths } from './schema';

export type { components, paths } from './schema';

export interface ApiClientOptions {
  /**
   * Adresse de l'API. Côté serveur Next.js : adresse interne du conteneur
   * Symfony (ex. http://app) ; côté navigateur : chaîne vide (même origine).
   */
  baseUrl: string;
  /**
   * Hôte public à transmettre quand l'appel passe par le réseau interne :
   * Symfony génère les URLs absolues (url, alternates → hreflang) depuis
   * l'hôte de la requête. Sans cela, elles pointeraient vers « app ».
   */
  publicOrigin?: string;
  /** En-têtes supplémentaires (cookie de session de l'admin, X-Forwarded-For…). */
  headers?: Record<string, string>;
}

/**
 * Client typé de l'API Symfony (types générés depuis openapi.json :
 * `pnpm --filter @alivaon/api-client generate`).
 *
 * JSON-LD par défaut : les listes paginées portent totalItems / view.
 */
export function createApiClient(options: ApiClientOptions): Client<paths> {
  const headers: Record<string, string> = { Accept: 'application/ld+json', ...options.headers };

  if (options.publicOrigin) {
    // Pas d'en-tête Host : le fetch de Node l'ignore (vérifié). Symfony lit
    // X-Forwarded-Host, auquel il fait confiance venant d'un réseau privé.
    const origin = new URL(options.publicOrigin);
    headers['X-Forwarded-Host'] = origin.host;
    headers['X-Forwarded-Proto'] = origin.protocol.replace(':', '');
  }

  return createClient<paths>({ baseUrl: options.baseUrl, headers });
}
