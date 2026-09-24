import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { absUrl, normText, sortKeysDeep } from './normalize.ts';
import type { HtmlSnapshot, ImageRef, LinkRef } from './types.ts';

/** Éléments dont le contenu n'est pas du texte visible par un moteur. */
const SKIPPED_TAGS = new Set(['script', 'style', 'noscript', 'template', 'svg', 'iframe', 'head']);

/** <link> techniques sans portée SEO, et qui changeront forcément avec Next.js. */
const IGNORED_LINK_RELS = new Set(['stylesheet', 'preload', 'modulepreload', 'prefetch', 'dns-prefetch', 'preconnect']);

/** Metas propres à une requête (jetons), exclues de la comparaison. */
const IGNORED_META = /^name:(csrf-|_token)/i;

/**
 * Éléments affichés en ligne par défaut (CSS) : aucune séparation autour
 * d'eux, comme à l'écran. « Totale</span>Suivi » s'affiche « TotaleSuivi » :
 * un mot collé est un écart réel, que la comparaison doit voir.
 */
const INLINE_TAGS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'span',
  'strong', 'sub', 'sup', 'time', 'u', 'var', 'label', 'img', 'input', 'button', 'select', 'textarea', 'font', 'wbr',
]);

/**
 * Texte d'un sous-arbre tel qu'affiché : blancs des nœuds texte conservés,
 * séparation à la frontière des blocs (div, p, h2…, br) seulement.
 * `.text()` de cheerio colle « Titre</h2><p>Paragraphe » en « TitreParagraphe » ;
 * joindre tous les nœuds par une espace masquerait les mots collés.
 * Les commentaires (séparateurs de texte de React) sont ignorés.
 */
export function textOf(node: AnyNode): string {
  let out = '';
  const walk = (n: AnyNode): void => {
    if (n.type === 'text') {
      out += (n as unknown as { data: string }).data;
      return;
    }
    if (n.type !== 'tag' && n.type !== 'root' && n.type !== 'script' && n.type !== 'style') return;
    const name = 'name' in n ? (n as Element).name : '';
    if (SKIPPED_TAGS.has(name)) return;
    const block = name !== '' && !INLINE_TAGS.has(name);
    if (block) out += ' ';
    if ('children' in n) for (const child of (n as Element).children) walk(child);
    if (block) out += ' ';
  };
  walk(node);
  return normText(out);
}

export function extractPage(html: string, pageUrl: string): HtmlSnapshot {
  const $ = cheerio.load(html);

  const metas: Record<string, string[]> = {};
  $('meta').each((_, el) => {
    const $el = $(el);
    const attr = $el.attr('name') ? 'name' : $el.attr('property') ? 'property' : $el.attr('http-equiv') ? 'http-equiv' : $el.attr('charset') !== undefined ? 'charset' : null;
    if (!attr) return;
    const key = attr === 'charset' ? 'charset' : `${attr}:${($el.attr(attr) ?? '').toLowerCase()}`;
    if (IGNORED_META.test(key)) return;
    const value = attr === 'charset' ? ($el.attr('charset') ?? '') : normText($el.attr('content'));
    (metas[key] ??= []).push(value);
  });

  const canonicals: string[] = [];
  const hreflang: HtmlSnapshot['hreflang'] = [];
  const headLinks: HtmlSnapshot['headLinks'] = [];
  $('link[rel]').each((_, el) => {
    const $el = $(el);
    const rels = ($el.attr('rel') ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    const href = absUrl($el.attr('href'), pageUrl) ?? '';
    if (rels.includes('canonical')) {
      canonicals.push(href);
    } else if (rels.includes('alternate') && $el.attr('hreflang')) {
      hreflang.push({ hreflang: ($el.attr('hreflang') ?? '').toLowerCase(), href });
    } else if (!rels.some((r) => IGNORED_LINK_RELS.has(r))) {
      headLinks.push({ rel: rels.join(' '), href, type: $el.attr('type') ?? null, sizes: $el.attr('sizes') ?? null });
    }
  });

  const jsonLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    try {
      jsonLd.push(sortKeysDeep(JSON.parse(raw)));
    } catch {
      // Un JSON-LD invalide est ignoré par Google : c'est un état à figer tel quel.
      jsonLd.push({ __invalidJsonLd: normText(raw) });
    }
  });

  const headings: HtmlSnapshot['headings'] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push({ level: Number(el.tagName.slice(1)), text: textOf(el) });
  });

  const links = new Map<string, LinkRef>();
  $('body a[href]').each((_, el) => {
    const $el = $(el);
    const href = absUrl($el.attr('href'), pageUrl);
    if (!href) return;
    const text = textOf(el) || normText($el.find('img[alt]').first().attr('alt')) || normText($el.attr('aria-label')) || normText($el.attr('title'));
    const rel = ($el.attr('rel') ?? '').toLowerCase().split(/\s+/).filter(Boolean).sort().join(' ');
    const key = `${href}\u0000${text}\u0000${rel}`;
    const existing = links.get(key);
    if (existing) existing.count++;
    else links.set(key, { href, text, rel, count: 1 });
  });

  const images = new Map<string, ImageRef>();
  $('body img').each((_, el) => {
    const $el = $(el);
    const src = absUrl($el.attr('src') ?? $el.attr('data-src'), pageUrl);
    if (!src) return;
    const altAttr = $el.attr('alt');
    const alt = altAttr === undefined ? null : normText(altAttr);
    const key = `${src}\u0000${alt ?? '\u0001'}`;
    const existing = images.get(key);
    if (existing) existing.count++;
    else images.set(key, { src, alt, count: 1 });
  });

  const bgImages = new Set<string>();
  $('[data-bg-src]').each((_, el) => {
    const src = absUrl($(el).attr('data-bg-src'), pageUrl);
    if (src) bgImages.add(src);
  });

  const body = $('body').get(0);

  return {
    lang: $('html').attr('lang') ?? null,
    titles: $('title').map((_, el) => normText($(el).text())).get(),
    metas,
    canonicals,
    hreflang: hreflang.sort((a, b) => a.hreflang.localeCompare(b.hreflang) || a.href.localeCompare(b.href)),
    headLinks: headLinks.sort((a, b) => a.rel.localeCompare(b.rel) || a.href.localeCompare(b.href)),
    jsonLd,
    headings,
    text: body ? textOf(body) : '',
    links: [...links.values()].sort((a, b) => a.href.localeCompare(b.href) || a.text.localeCompare(b.text) || a.rel.localeCompare(b.rel)),
    images: [...images.values()].sort((a, b) => a.src.localeCompare(b.src) || (a.alt ?? '').localeCompare(b.alt ?? '')),
    bgImages: [...bgImages].sort(),
  };
}
