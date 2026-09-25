import { existsSync } from 'node:fs';

/**
 * Sonde de santé du conteneur : healthcheck Docker et contrôle de Traefik
 * (toutes les secondes), sur le réseau interne.
 *
 * Drain : le déploiement crée DRAIN_FILE dans l'ancien conteneur avant de
 * l'arrêter. La sonde répond alors 503 et Traefik cesse de lui envoyer des
 * requêtes, sans en perdre aucune (workflow Deploy).
 */
export const dynamic = 'force-dynamic';

const DRAIN_FILE = '/tmp/alivaon-drain';

export function GET(): Response {
  if (existsSync(DRAIN_FILE)) {
    return Response.json({ status: 'draining' }, { status: 503 });
  }

  return Response.json({ status: 'ok' });
}
