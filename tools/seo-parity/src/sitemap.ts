import * as cheerio from 'cheerio';
import { normText } from './normalize.ts';
import type { SitemapEntry } from './types.ts';

export interface ParsedSitemap {
  /** Sitemaps enfants si le document est un <sitemapindex>. */
  children: string[];
  entries: SitemapEntry[];
}

export function parseSitemap(xml: string): ParsedSitemap {
  const $ = cheerio.load(xml, { xml: true });

  const children = $('sitemapindex > sitemap > loc')
    .map((_, el) => normText($(el).text()))
    .get();

  const entries: SitemapEntry[] = $('urlset > url')
    .map((_, el) => {
      const $url = $(el);
      const child = (name: string): string | null => {
        const value = normText($url.children(name).first().text());
        return value === '' ? null : value;
      };
      const alternates = $url
        .children()
        .filter((_, c) => (c as { name?: string }).name === 'xhtml:link')
        .map((_, c) => ({ hreflang: ($(c).attr('hreflang') ?? '').toLowerCase(), href: $(c).attr('href') ?? '' }))
        .get()
        .sort((a, b) => a.hreflang.localeCompare(b.hreflang));
      return { loc: child('loc') ?? '', lastmod: child('lastmod'), changefreq: child('changefreq'), priority: child('priority'), alternates };
    })
    .get();

  return { children, entries };
}
