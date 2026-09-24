import { NextResponse, type NextRequest } from 'next/server';
import table from './generated/routes.json';

/**
 * Comportements d'URL du site Symfony, reproduits à l'identique :
 * - slash final → 301 vers l'URL sans slash, seulement si elle correspond à
 *   une route (RedirectableUrlMatcher ; query string conservée) ;
 * - anciennes URLs (RedirectController, routes.json) → 301, sans query string ;
 * - en-tête x-alivaon-path : chemin demandé, pour le canonical des pages 404.
 *
 * Les redirections portent l'origine publique (SITE_ORIGIN) : derrière
 * Traefik, Next reçoit la requête en HTTP et produirait un Location http://.
 */
const ORIGIN = (process.env.SITE_ORIGIN ?? 'https://www.alivaon.com').replace(/\/$/, '');

const ROUTES = Object.values(table.paths as Record<string, Record<string, string>>)
  .flatMap((locales) => Object.values(locales))
  .map((pattern) => new RegExp(`^${pattern.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{\w+\\?\}/g, '[^/]+')}$`));

const LEGACY = new Map(table.redirects.map((r) => [r.from, r.to]));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const legacy = LEGACY.get(pathname);
  if (legacy) {
    return NextResponse.redirect(`${ORIGIN}${legacy}`, 301);
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const stripped = pathname.replace(/\/+$/, '');
    if (ROUTES.some((route) => route.test(stripped))) {
      return NextResponse.redirect(`${ORIGIN}${stripped}${search}`, 301);
    }
  }

  const headers = new Headers(request.headers);
  headers.set('x-alivaon-path', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Ni les fichiers internes de Next, ni les routes techniques.
  matcher: ['/((?!_next/|api/health|api/revalidate).*)'],
};
