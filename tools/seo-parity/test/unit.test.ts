import { describe, expect, it } from 'vitest';
import { applyExceptions, compareSnapshots, hasBlocking, type SnapshotData } from '../src/compare.ts';
import { extractPage } from '../src/extract.ts';
import { absUrl, fileNameForUrl, normText, rewriteOrigins } from '../src/normalize.ts';
import { parseSitemap } from '../src/sitemap.ts';
import type { PageRecord } from '../src/types.ts';

const PAGE = `<!DOCTYPE html><html lang="fr"><head>
  <meta charset="UTF-8"><title> Blog  Alivaon </title>
  <meta name="description" content="Articles&nbsp;récents">
  <meta name="robots" content="index, follow">
  <meta name="csrf-token" content="abc123">
  <meta property="og:image" content="https://www.alivaon.com/build/images/og/og-default.png">
  <link rel="canonical" href="https://www.alivaon.com/blog">
  <link rel="alternate" hreflang="en" href="https://www.alivaon.com/en/blog">
  <link rel="alternate" hreflang="fr" href="https://www.alivaon.com/blog">
  <link rel="alternate" hreflang="x-default" href="https://www.alivaon.com/blog">
  <link rel="stylesheet" href="/build/app.123.css">
  <link rel="icon" href="/build/images/logo/favicon.png">
  <script type="application/ld+json">{"name":"Alivaon","@type":"Organization","@context":"https://schema.org"}</script>
</head><body>
  <h1>Le blog</h1><p>Premier<br>paragraphe</p><h2>Récents</h2>
  <a href="/blog/article-1">Article 1</a>
  <a href="/blog/article-1">Article 1</a>
  <a href="/contact#form"><img src="/build/images/icon.png" alt="Contact"></a>
  <a href="#top">Haut</a><a href="javascript:void(0)">x</a>
  <a href="mailto:contact@alivaon.com">Écrire</a>
  <img src="/uploads/a.jpg"><img src="/_next/image?url=%2Fuploads%2Fb.jpg&w=640&q=75" alt="">
  <div data-bg-src="/build/images/bg/hero.jpg"></div>
  <script>var hidden = "pas du texte";</script>
</body></html>`;

describe('normalize', () => {
  it('normalise espaces et insécables', () => {
    expect(normText('  a  b\n\tc ')).toBe('a b c');
  });

  it('résout les liens et écarte les non-liens', () => {
    expect(absUrl('/blog#x', 'https://www.alivaon.com/en')).toBe('https://www.alivaon.com/blog');
    expect(absUrl('#top', 'https://www.alivaon.com/')).toBeNull();
    expect(absUrl('javascript:void(0)', 'https://www.alivaon.com/')).toBeNull();
    expect(absUrl('tel:+237600000000', 'https://www.alivaon.com/')).toBe('tel:+237600000000');
  });

  it('décode les URLs next/image vers la source réelle', () => {
    expect(absUrl('/_next/image?url=%2Fuploads%2Fb.jpg&w=640&q=75', 'https://www.alivaon.com/')).toBe('https://www.alivaon.com/uploads/b.jpg');
  });

  it("réécrit l'origine staging vers la prod, domaine nu compris", () => {
    const json = JSON.stringify({ a: 'https://www.staging.alivaon.com/blog', b: 'http://staging.alivaon.com/', c: 'https://example.com/' });
    const out = rewriteOrigins(json, 'https://www.staging.alivaon.com', 'https://www.alivaon.com');
    expect(JSON.parse(out)).toEqual({ a: 'https://www.alivaon.com/blog', b: 'http://alivaon.com/', c: 'https://example.com/' });
  });

  it('produit des noms de fichiers distincts pour des URLs ne différant que par la casse', () => {
    expect(fileNameForUrl('https://www.alivaon.com/BLOG').toLowerCase()).not.toBe(fileNameForUrl('https://www.alivaon.com/blog').toLowerCase());
  });
});

describe('extractPage', () => {
  const snap = extractPage(PAGE, 'https://www.alivaon.com/blog');

  it('relève les signaux de tête', () => {
    expect(snap.lang).toBe('fr');
    expect(snap.titles).toEqual(['Blog Alivaon']);
    expect(snap.metas['name:description']).toEqual(['Articles récents']);
    expect(snap.metas['name:csrf-token']).toBeUndefined();
    expect(snap.canonicals).toEqual(['https://www.alivaon.com/blog']);
    expect(snap.hreflang.map((h) => h.hreflang)).toEqual(['en', 'fr', 'x-default']);
    expect(snap.headLinks).toEqual([{ rel: 'icon', href: 'https://www.alivaon.com/build/images/logo/favicon.png', type: null, sizes: null }]);
  });

  it('normalise le JSON-LD (ordre des clés indifférent)', () => {
    expect(JSON.stringify(snap.jsonLd)).toBe(JSON.stringify([{ '@context': 'https://schema.org', '@type': 'Organization', name: 'Alivaon' }]));
  });

  it('sépare les blocs de texte et ignore les scripts', () => {
    expect(snap.text).toBe('Le blog Premier paragraphe Récents Article 1 Article 1 Haut x Écrire');
    expect(snap.headings).toEqual([{ level: 1, text: 'Le blog' }, { level: 2, text: 'Récents' }]);
  });

  it('agrège les liens et prend le alt comme texte d’un lien image', () => {
    expect(snap.links).toEqual([
      { href: 'https://www.alivaon.com/blog/article-1', text: 'Article 1', rel: '', count: 2 },
      { href: 'https://www.alivaon.com/contact', text: 'Contact', rel: '', count: 1 },
      { href: 'mailto:contact@alivaon.com', text: 'Écrire', rel: '', count: 1 },
    ]);
  });

  it('distingue alt absent et alt vide', () => {
    expect(snap.images.find((i) => i.src.endsWith('/uploads/a.jpg'))?.alt).toBeNull();
    expect(snap.images.find((i) => i.src.endsWith('/uploads/b.jpg'))?.alt).toBe('');
    expect(snap.bgImages).toEqual(['https://www.alivaon.com/build/images/bg/hero.jpg']);
  });
});

describe('parseSitemap', () => {
  it('lit les entrées et leurs alternates hreflang', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>https://www.alivaon.com/</loc><lastmod>2026-09-23</lastmod><changefreq>weekly</changefreq><priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.alivaon.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://www.alivaon.com/en" /></url>
</urlset>`;
    const { entries, children } = parseSitemap(xml);
    expect(children).toEqual([]);
    expect(entries).toEqual([
      {
        loc: 'https://www.alivaon.com/',
        lastmod: '2026-09-23',
        changefreq: 'weekly',
        priority: '1.0',
        alternates: [
          { hreflang: 'en', href: 'https://www.alivaon.com/en' },
          { hreflang: 'x-default', href: 'https://www.alivaon.com/' },
        ],
      },
    ]);
  });
});

describe('compareSnapshots', () => {
  const page = (overrides: Partial<PageRecord> = {}, html = PAGE): PageRecord => ({
    url: 'https://www.alivaon.com/blog',
    discoveredVia: ['link', 'sitemap'],
    inlinks: 3,
    status: 200,
    chain: [],
    finalUrl: 'https://www.alivaon.com/blog',
    headers: { 'content-type': 'text/html; charset=UTF-8' },
    html: extractPage(html, 'https://www.alivaon.com/blog'),
    ...overrides,
  });
  const snapshot = (p: PageRecord): SnapshotData => ({
    pages: new Map([[p.url, p]]),
    probes: new Map(),
    sitemap: new Map(),
    files: new Map(),
    assets: new Map(),
    lighthouse: new Map(),
  });

  it("ne signale rien entre deux relevés identiques (casse du charset comprise)", () => {
    const diffs = compareSnapshots(snapshot(page()), snapshot(page({ headers: { 'content-type': 'text/html; charset=utf-8' } })));
    expect(diffs).toEqual([]);
  });

  it('bloque sur un title modifié', () => {
    const diffs = compareSnapshots(snapshot(page()), snapshot(page({}, PAGE.replace('Blog  Alivaon', 'Blog | Alivaon'))));
    expect(diffs.map((d) => [d.field, d.severity])).toEqual([['html.titles', 'blocking']]);
    expect(hasBlocking(diffs)).toBe(true);
  });

  it('bloque sur une hreflang disparue et un JSON-LD modifié', () => {
    const changed = PAGE.replace('<link rel="alternate" hreflang="en" href="https://www.alivaon.com/en/blog">', '').replace('"name":"Alivaon"', '"name":"Alivaon SARL"');
    const fields = compareSnapshots(snapshot(page()), snapshot(page({}, changed))).map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['html.hreflang', 'html.jsonLd']));
  });

  it('bloque une page devenue orpheline (plus aucun lien interne)', () => {
    const diffs = compareSnapshots(snapshot(page()), snapshot(page({ discoveredVia: ['baseline', 'sitemap'] })));
    expect(diffs.map((d) => d.field)).toEqual(['discovery']);
  });

  it('un nombre de liens dupliqués différent est informatif seulement', () => {
    const target = page();
    target.html!.links[0]!.count = 1; // menu mobile rendu une fois de moins, par exemple
    const diffs = compareSnapshots(snapshot(page()), snapshot(target));
    expect(diffs.map((d) => [d.field, d.severity])).toEqual([
      ['html.links.counts', 'info'],
    ]);
  });

  it('une exception validée neutralise le blocage mais reste tracée', () => {
    const diffs = compareSnapshots(snapshot(page()), snapshot(page({}, PAGE.replace('Blog  Alivaon', 'Autre'))));
    const excepted = applyExceptions(diffs, [{ url: 'https://www.alivaon.com/blog*', field: 'html.titles', reason: 'test' }]);
    expect(hasBlocking(excepted)).toBe(false);
    expect(excepted[0]?.exception).toBe('test');
  });
});
