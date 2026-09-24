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

/** Listes paginées par KnpPaginator ($request->query->getInt('page', 1)). */
const PAGINATED = ['app_blog_index', 'app_blog_by_category', 'app_blog_by_tag', 'app_portfolio_index']
  .flatMap((name) => Object.values((table.paths as Record<string, Record<string, string>>)[name]))
  .map((pattern) => new RegExp(`^${pattern.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{\w+\\?\}/g, '[^/]+')}$`));

/** Offres d'emploi : pagination maison ($page = max(1, getInt('page', 1))). */
const CAREERS = Object.values((table.paths as Record<string, Record<string, string>>).app_carriere_index).map((p) => new RegExp(`^${p}$`));

/**
 * ?page= invalide sur une liste paginée :
 * - pas un entier (FILTER_VALIDATE_INT : « abc », « 1.5 », vide) → 400, comme Symfony ;
 * - entier < 1 : Symfony répond 500 (exception de KnpPaginator) ; on répond
 *   404 plutôt que de reproduire une erreur serveur (écart soumis à validation).
 */
function invalidPage(pathname: string, params: URLSearchParams): 400 | 404 | null {
  if (!params.has('page')) return null;
  const knp = PAGINATED.some((route) => route.test(pathname));
  if (!knp && !CAREERS.some((route) => route.test(pathname))) return null;
  const raw = (params.get('page') ?? '').trim();
  if (!/^[+-]?\d+$/.test(raw)) return 400;
  // Carrières : max(1, getInt('page')) — un entier ≤ 0 vaut 1, sans erreur.
  return knp && Number(raw) < 1 ? 404 : null;
}

const ERROR_BODY = (status: number) =>
  `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>${status}</title></head><body><h1>${status}</h1></body></html>`;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const legacy = LEGACY.get(pathname);
  if (legacy) {
    return NextResponse.redirect(`${ORIGIN}${legacy}`, 301);
  }

  const pageError = invalidPage(pathname, request.nextUrl.searchParams);
  if (pageError) {
    return new NextResponse(ERROR_BODY(pageError), { status: pageError, headers: { 'content-type': 'text/html; charset=UTF-8' } });
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
