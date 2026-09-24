/**
 * Sonde de santé du conteneur (healthcheck Docker, réseau interne). Traefik
 * route /api/* vers Symfony : cette route n'est pas exposée publiquement.
 */
export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json({ status: 'ok' });
}
