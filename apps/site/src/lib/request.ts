import { headers } from 'next/headers';

/**
 * Chemin demandé (pathInfo), transmis par proxy.ts dans l'en-tête
 * x-alivaon-path : les pages 404 en ont besoin pour le canonical, comme
 * app.request.pathInfo côté Twig.
 */
export async function requestPath(): Promise<string> {
  return (await headers()).get('x-alivaon-path') ?? '/';
}
