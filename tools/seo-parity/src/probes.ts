/**
 * Sondes techniques : comportements d'URL qu'aucun crawl de liens ne découvre,
 * mais que Google connaît (anciennes URLs, variantes, erreurs). Chacune fige le
 * code HTTP et la chaîne de redirections actuels.
 */

export interface ProbeSpec {
  name: string;
  url: string;
}

const NOT_FOUND_PATHS = [
  '/__seo-parity-404',
  '/en/__seo-parity-404',
  '/blog/__seo-parity-404',
  '/en/blog/__seo-parity-404',
  '/blog/category/__seo-parity-404',
  '/en/blog/category/__seo-parity-404',
  '/blog/tag/__seo-parity-404',
  '/en/blog/tag/__seo-parity-404',
  '/portfolio/__seo-parity-404',
  '/en/portfolio/__seo-parity-404',
  '/services/__seo-parity-404',
  '/en/services/__seo-parity-404',
  '/team/__seo-parity-404',
  '/en/team/__seo-parity-404',
  '/carrieres/__seo-parity-404',
  '/en/careers/__seo-parity-404',
  // Routes FR sous préfixe EN et inversement : chaque locale a ses chemins propres.
  '/en/carrieres',
  '/careers',
  '/en/mentions-legales',
  '/legal-notice',
  // Pagination hors limites.
  '/blog?page=999',
  '/blog?page=0',
  '/blog?page=abc',
];

const VARIANT_PATHS: [string, string][] = [
  ['uppercase-blog', '/BLOG'],
  ['uppercase-en', '/EN'],
  ['mixed-case-contact', '/Contact'],
  ['double-slash', '//blog'],
  ['index-php', '/index.php'],
  ['index-php-path', '/index.php/blog'],
  ['admin', '/admin'],
  ['admin-trailing', '/admin/'],
  ['login', '/login'],
  ['logout', '/logout'],
  ['adminer', '/adminer.php'],
  ['ping', '/ping'],
  ['en-trailing', '/en/'],
];

export function buildProbes(origin: string, sitemapLocs: string[], legacyPaths: string[]): ProbeSpec[] {
  const base = new URL(origin);
  const apexHost = base.hostname.replace(/^www\./, '');
  const probes: ProbeSpec[] = [];
  const add = (name: string, url: string): void => {
    probes.push({ name, url });
  };

  add('home', `${base.origin}/`);
  add('http-home', `http://${base.host}/`);
  add('http-page', `http://${base.host}/blog`);
  if (apexHost !== base.hostname) {
    add('apex-home', `https://${apexHost}/`);
    add('apex-page', `https://${apexHost}/blog`);
    add('apex-page-query', `https://${apexHost}/blog?page=2`);
    add('http-apex-home', `http://${apexHost}/`);
    add('http-apex-page', `http://${apexHost}/blog`);
  }

  for (const [name, path] of VARIANT_PATHS) add(name, base.origin + path);
  for (const path of NOT_FOUND_PATHS) add(`not-found:${path}`, base.origin + path);
  for (const path of legacyPaths) add(`legacy:${path}`, base.origin + path);

  const locSet = new Set(sitemapLocs);
  for (const loc of sitemapLocs) {
    const url = new URL(loc);
    if (url.pathname === '/') continue;
    // Slash final : Symfony répond 301 vers la version sans slash.
    add(`trailing-slash:${url.pathname}`, `${url.origin}${url.pathname}/`);

    // Contenu dans l'autre locale sous le même slug : doit rester 404 tant que
    // la traduction n'existe pas sous ce slug (aucun repli de langue).
    const counterpart = url.pathname === '/en' ? '/' : url.pathname.startsWith('/en/') ? url.pathname.slice(3) : `/en${url.pathname}`;
    const counterpartUrl = `${url.origin}${counterpart}`;
    if (!locSet.has(counterpartUrl)) add(`cross-locale:${counterpart}`, counterpartUrl);
  }

  // Dédoublonnage par URL en gardant le premier nom.
  const seen = new Set<string>();
  return probes.filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}
