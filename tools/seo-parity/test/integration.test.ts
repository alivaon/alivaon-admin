import { createServer, type Server } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { compareSnapshots, hasBlocking, loadSnapshot } from '../src/compare.ts';
import { takeSnapshot } from '../src/snapshot.ts';

/**
 * Mini-site reproduisant les comportements de l'actuel site Symfony :
 * FR à la racine, EN sous /en, slash final → 301, 404 franches, sitemap + robots.
 * `variant` simule les écarts typiques d'une réécriture Next.js.
 */
function startSite(variant: { trailingSlashStatus?: number; dropHreflang?: boolean } = {}): Promise<Server> {
  const page = (lang: string, path: string, title: string, links: string[], alt: string | null): string => `<!DOCTYPE html>
<html lang="${lang}"><head><title>${title}</title>
<link rel="canonical" href="ORIGIN${path}">
${alt && !variant.dropHreflang ? `<link rel="alternate" hreflang="fr" href="ORIGIN${lang === 'fr' ? path : alt}"><link rel="alternate" hreflang="en" href="ORIGIN${lang === 'en' ? path : alt}">` : ''}
</head><body><h1>${title}</h1>${links.map((l) => `<a href="${l}">${l}</a>`).join('')}<img src="/build/images/logo.png" alt="Alivaon"></body></html>`;

  const routes: Record<string, [string, string, string[], string | null]> = {
    '/': ['fr', 'Accueil', ['/blog', '/contact'], '/en'],
    '/en': ['en', 'Home', ['/en/blog'], '/'],
    '/blog': ['fr', 'Blog', ['/blog/article', '/'], '/en/blog'],
    '/en/blog': ['en', 'Blog EN', ['/en'], '/blog'],
    '/blog/article': ['fr', 'Article', ['/blog'], null],
    '/contact': ['fr', 'Contact', ['/'], null],
  };

  const server = createServer((req, res) => {
    const origin = `http://${req.headers.host}`;
    const url = new URL(req.url ?? '/', origin);
    const path = url.pathname;
    if (path === '/robots.txt') {
      res.writeHead(200, { 'content-type': 'text/plain' }).end(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml`);
      return;
    }
    if (path === '/sitemap.xml') {
      const locs = ['/', '/en', '/blog', '/en/blog', '/blog/article', '/contact'];
      res.writeHead(200, { 'content-type': 'application/xml' }).end(
        `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locs.map((l) => `<url><loc>${origin}${l}</loc><priority>0.5</priority></url>`).join('')}</urlset>`,
      );
      return;
    }
    if (path === '/build/images/logo.png') {
      res.writeHead(200, { 'content-type': 'image/png' }).end(Buffer.from([0x89, 0x50]));
      return;
    }
    if (path.length > 1 && path.endsWith('/') && routes[path.slice(0, -1)]) {
      res.writeHead(variant.trailingSlashStatus ?? 301, { location: `${origin}${path.slice(0, -1)}` }).end();
      return;
    }
    const route = routes[path];
    if (!route) {
      res.writeHead(404, { 'content-type': 'text/html; charset=UTF-8' }).end('<html><head><meta name="robots" content="noindex"></head><body>404</body></html>');
      return;
    }
    const [lang, title, links, alt] = route;
    res.writeHead(200, { 'content-type': 'text/html; charset=UTF-8' }).end(page(lang, path, title, links, alt).replaceAll('ORIGIN', origin));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const originOf = (s: Server): string => `http://127.0.0.1:${(s.address() as AddressInfo).port}`;

describe('relevé et comparaison de bout en bout', () => {
  let workDir: string;
  const servers: Server[] = [];

  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'seo-parity-'));
  });
  afterAll(async () => {
    servers.forEach((s) => s.close());
    await rm(workDir, { recursive: true, force: true });
  });

  const snap = async (server: Server, label: string, seedsFrom: string | null = null): Promise<string> => {
    const outDir = join(workDir, label);
    await takeSnapshot({
      origin: originOf(server),
      rewriteTo: 'http://www.alivaon.com',
      outDir,
      seedFiles: [],
      legacyFile: null,
      seedsFromSnapshot: seedsFrom,
      concurrency: 2,
      delayMs: 0,
      maxUrls: 100,
      maxQueryVariantsPerPath: 5,
      log: () => {},
    });
    return outDir;
  };

  it('relève pages, redirections et sondes, puis se compare à lui-même sans écart', async () => {
    const site = await startSite();
    servers.push(site);
    const dir = await snap(site, 'baseline');
    const data = await loadSnapshot(dir);

    expect([...data.pages.keys()]).toEqual(
      ['/', '/blog', '/blog/article', '/contact', '/en', '/en/blog'].map((p) => `http://www.alivaon.com${p}`),
    );
    expect(data.pages.get('http://www.alivaon.com/blog')?.html?.canonicals).toEqual(['http://www.alivaon.com/blog']);
    expect(data.probes.get('trailing-slash:/blog')?.chain).toEqual([{ url: 'http://www.alivaon.com/blog/', status: 301, location: 'http://www.alivaon.com/blog' }]);
    expect(data.probes.get('not-found:/blog/__seo-parity-404')?.status).toBe(404);
    expect(data.probes.get('cross-locale:/en/contact')?.status).toBe(404);
    expect(data.assets.get('http://www.alivaon.com/build/images/logo.png')?.status).toBe(200);

    const again = await snap(site, 'again', dir);
    const diffs = compareSnapshots(data, await loadSnapshot(again));
    expect(diffs.filter((d) => d.severity === 'blocking')).toEqual([]);
  });

  it('détecte un 308 à la place du 301 (comportement par défaut de Next.js) et une hreflang perdue', async () => {
    const baseline = await startSite();
    const next = await startSite({ trailingSlashStatus: 308, dropHreflang: true });
    servers.push(baseline, next);
    const base = await loadSnapshot(await snap(baseline, 'b2'));
    const target = await loadSnapshot(await snap(next, 't2', join(workDir, 'b2')));
    const diffs = compareSnapshots(base, target);

    expect(hasBlocking(diffs)).toBe(true);
    expect(diffs.some((d) => d.field === 'probe.trailing-slash:/blog.chain')).toBe(true);
    expect(diffs.some((d) => d.url === 'http://www.alivaon.com/blog' && d.field === 'html.hreflang')).toBe(true);
  });
});
