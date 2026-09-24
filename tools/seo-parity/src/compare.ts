import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AssetRecord, FileRecord, HtmlSnapshot, LighthouseSummary, PageRecord, ProbeRecord, SitemapEntry } from './types.ts';

export type Severity = 'blocking' | 'info';

export interface Diff {
  severity: Severity;
  scope: 'coverage' | 'page' | 'probe' | 'sitemap' | 'file' | 'asset' | 'lighthouse';
  url: string;
  field: string;
  baseline: unknown;
  target: unknown;
  /** Motif de l'exception validée qui neutralise ce blocage. */
  exception?: string;
}

export interface ParityException {
  /** URL exacte, ou motif avec * (ex. "https://www.alivaon.com/blog/*"). "*" = toutes. */
  url: string;
  /** Préfixe du champ (ex. "headers.cache-control", "html.text"). */
  field: string;
  reason: string;
}

export interface SnapshotData {
  pages: Map<string, PageRecord>;
  probes: Map<string, ProbeRecord>;
  sitemap: Map<string, SitemapEntry>;
  files: Map<string, FileRecord & { text: string | null }>;
  assets: Map<string, AssetRecord>;
  lighthouse: Map<string, LighthouseSummary>;
}

/** En-têtes à portée SEO : tout écart bloque. */
const SEO_HEADERS = ['content-type', 'x-robots-tag', 'content-language', 'link', 'location'];
/** En-têtes suivis pour information (changeront légitimement avec Next.js). */
const INFO_HEADERS = ['cache-control', 'vary', 'set-cookie'];
/** Fichiers dont le contenu doit rester identique à l'octet près. */
const EXACT_TEXT_FILES = ['/robots.txt', '/llms.txt'];

/** Seuils de performance : au-delà, la nouvelle version est jugée en régression. */
export const LIGHTHOUSE_TOLERANCE = {
  scoreDrop: 0.03,
  lcpRatio: 1.1,
  fcpRatio: 1.1,
  tbtRatio: 1.2,
  tbtMinDeltaMs: 50,
  clsDelta: 0.02,
};

export async function loadSnapshot(dir: string): Promise<SnapshotData> {
  const readJson = async <T>(name: string, fallback: T): Promise<T> => {
    const path = join(dir, name);
    return existsSync(path) ? (JSON.parse(await readFile(path, 'utf8')) as T) : fallback;
  };

  const index = await readJson<{ url: string; file: string }[]>('pages.index.json', []);
  const pages = new Map<string, PageRecord>();
  for (const { url, file } of index) pages.set(url, JSON.parse(await readFile(join(dir, 'pages', file), 'utf8')) as PageRecord);

  const files = new Map<string, FileRecord & { text: string | null }>();
  for (const f of await readJson<FileRecord[]>('files.json', [])) {
    const textPath = join(dir, 'files', f.path.replace(/^\//, '').replace(/\//g, '__'));
    files.set(f.path, { ...f, text: existsSync(textPath) ? await readFile(textPath, 'utf8') : null });
  }

  return {
    pages,
    probes: new Map((await readJson<ProbeRecord[]>('probes.json', [])).map((p) => [p.name, p])),
    sitemap: new Map((await readJson<SitemapEntry[]>('sitemap.json', [])).map((e) => [e.loc, e])),
    files,
    assets: new Map((await readJson<AssetRecord[]>('assets.json', [])).map((a) => [a.url, a])),
    lighthouse: new Map((await readJson<LighthouseSummary[]>('lighthouse/summary.json', [])).map((l) => [l.template, l])),
  };
}

export function compareSnapshots(base: SnapshotData, target: SnapshotData, exceptions: ParityException[] = []): Diff[] {
  const diffs: Diff[] = [];
  const push = (d: Diff): void => {
    diffs.push(d);
  };

  // ── Couverture et pages ──────────────────────────────────────────────────
  for (const url of union(base.pages.keys(), target.pages.keys())) {
    const b = base.pages.get(url);
    const t = target.pages.get(url);
    if (!b || !t) {
      push({ severity: 'blocking', scope: 'coverage', url, field: b ? 'coverage.missing' : 'coverage.new', baseline: b ? b.status : null, target: t ? t.status : null });
      continue;
    }
    comparePage(b, t, push);
  }

  // ── Sondes ───────────────────────────────────────────────────────────────
  for (const name of union(base.probes.keys(), target.probes.keys())) {
    const b = base.probes.get(name);
    const t = target.probes.get(name);
    if (!b || !t) {
      push({ severity: 'info', scope: 'probe', url: (b ?? t)!.url, field: `probe.${b ? 'missing' : 'new'}:${name}`, baseline: b?.status ?? null, target: t?.status ?? null });
      continue;
    }
    const field = (f: string): string => `probe.${name}.${f}`;
    eq(b.status, t.status) || push({ severity: 'blocking', scope: 'probe', url: b.url, field: field('status'), baseline: b.status, target: t.status });
    eq(chainOf(b), chainOf(t)) || push({ severity: 'blocking', scope: 'probe', url: b.url, field: field('chain'), baseline: chainOf(b), target: chainOf(t) });
    eq(b.headers['x-robots-tag'] ?? null, t.headers['x-robots-tag'] ?? null) ||
      push({ severity: 'blocking', scope: 'probe', url: b.url, field: field('x-robots-tag'), baseline: b.headers['x-robots-tag'] ?? null, target: t.headers['x-robots-tag'] ?? null });
  }

  // ── Sitemap ──────────────────────────────────────────────────────────────
  for (const loc of union(base.sitemap.keys(), target.sitemap.keys())) {
    const b = base.sitemap.get(loc);
    const t = target.sitemap.get(loc);
    if (!b || !t) {
      push({ severity: 'blocking', scope: 'sitemap', url: loc, field: b ? 'sitemap.missing' : 'sitemap.new', baseline: b ?? null, target: t ?? null });
      continue;
    }
    for (const key of ['changefreq', 'priority', 'alternates'] as const) {
      eq(b[key], t[key]) || push({ severity: 'blocking', scope: 'sitemap', url: loc, field: `sitemap.${key}`, baseline: b[key], target: t[key] });
    }
    // lastmod des pages statiques = date du jour côté Symfony : non déterministe.
    eq(b.lastmod, t.lastmod) || push({ severity: 'info', scope: 'sitemap', url: loc, field: 'sitemap.lastmod', baseline: b.lastmod, target: t.lastmod });
  }

  // ── Fichiers racine ──────────────────────────────────────────────────────
  for (const path of union(base.files.keys(), target.files.keys())) {
    const b = base.files.get(path);
    const t = target.files.get(path);
    if (!b || !t) continue;
    eq(b.status, t.status) || push({ severity: 'blocking', scope: 'file', url: path, field: 'file.status', baseline: b.status, target: t.status });
    eq(normType(b.contentType), normType(t.contentType)) || push({ severity: 'blocking', scope: 'file', url: path, field: 'file.content-type', baseline: b.contentType, target: t.contentType });
    if (EXACT_TEXT_FILES.includes(path)) {
      eq(b.text, t.text) || push({ severity: 'blocking', scope: 'file', url: path, field: 'file.text', baseline: b.text, target: t.text });
    } else if (b.sha256 !== t.sha256) {
      push({ severity: 'info', scope: 'file', url: path, field: 'file.sha256', baseline: b.sha256, target: t.sha256 });
    }
  }

  // ── Ressources (images indexées, og:image, icônes) ───────────────────────
  for (const [url, b] of base.assets) {
    const t = target.assets.get(url);
    if (!t) continue; // plus référencée : déjà signalé par les diffs d'images de page
    if (b.status === 200 && t.status !== 200) push({ severity: 'blocking', scope: 'asset', url, field: 'asset.status', baseline: b.status, target: t.status });
    else if (normType(b.contentType) !== normType(t.contentType)) push({ severity: 'info', scope: 'asset', url, field: 'asset.content-type', baseline: b.contentType, target: t.contentType });
  }
  for (const [url, t] of target.assets) {
    if (!base.assets.has(url) && t.status !== 200) push({ severity: 'blocking', scope: 'asset', url, field: 'asset.broken-new', baseline: null, target: t.status });
  }

  // ── Performance ──────────────────────────────────────────────────────────
  for (const [template, b] of base.lighthouse) {
    const t = target.lighthouse.get(template);
    if (!t) continue;
    compareLighthouse(b, t, push);
  }

  return applyExceptions(diffs, exceptions);
}

function comparePage(b: PageRecord, t: PageRecord, push: (d: Diff) => void): void {
  const url = b.url;
  const block = (field: string, baseline: unknown, target: unknown): void => {
    if (!eq(baseline, target)) push({ severity: 'blocking', scope: 'page', url, field, baseline, target });
  };
  const info = (field: string, baseline: unknown, target: unknown): void => {
    if (!eq(baseline, target)) push({ severity: 'info', scope: 'page', url, field, baseline, target });
  };

  block('status', b.status, t.status);
  block('chain', chainOf(b), chainOf(t));
  block('finalUrl', b.finalUrl, t.finalUrl);

  // Façon dont la page est découverte : un lien interne ou une entrée de sitemap perdus = page orpheline.
  const organic = (p: PageRecord): string[] => p.discoveredVia.filter((s) => s === 'link' || s === 'sitemap' || s === 'sitemap-alternate');
  block('discovery', organic(b), organic(t));
  info('inlinks', b.inlinks, t.inlinks);

  for (const h of SEO_HEADERS) block(`headers.${h}`, normHeader(h, b.headers[h]), normHeader(h, t.headers[h]));
  for (const h of INFO_HEADERS) info(`headers.${h}`, b.headers[h] ?? null, t.headers[h] ?? null);

  if (!b.html || !t.html) {
    block('html.present', Boolean(b.html), Boolean(t.html));
    return;
  }
  compareHtml(b.html, t.html, block, info);
}

function compareHtml(b: HtmlSnapshot, t: HtmlSnapshot, block: (f: string, b: unknown, t: unknown) => void, info: (f: string, b: unknown, t: unknown) => void): void {
  block('html.lang', b.lang, t.lang);
  block('html.titles', b.titles, t.titles);
  for (const key of union(Object.keys(b.metas), Object.keys(t.metas))) {
    const norm = (values: string[] | undefined) => values?.map((v) => normalizeMetaValue(key, v)) ?? null;
    block(`html.metas.${key}`, norm(b.metas[key]), norm(t.metas[key]));
  }
  block('html.canonicals', b.canonicals, t.canonicals);
  block('html.hreflang', b.hreflang, t.hreflang);
  setDiff('html.headLinks', b.headLinks.map((l) => JSON.stringify(l)), t.headLinks.map((l) => JSON.stringify(l)), block);
  block('html.jsonLd', b.jsonLd, t.jsonLd);
  block('html.headings', b.headings, t.headings);
  if (b.text !== t.text) block('html.text', textContext(b.text, t.text), textContext(t.text, b.text));
  setDiff('html.links', b.links.map(linkKey), t.links.map(linkKey), block);
  info('html.links.counts', countMap(b.links.map((l) => [linkKey(l), l.count])), countMap(t.links.map((l) => [linkKey(l), l.count])));
  setDiff('html.images', b.images.map(imageKey), t.images.map(imageKey), block);
  info('html.bgImages', b.bgImages, t.bgImages);
}

function compareLighthouse(b: LighthouseSummary, t: LighthouseSummary, push: (d: Diff) => void): void {
  const tol = LIGHTHOUSE_TOLERANCE;
  const reg = (field: string, baseline: unknown, target: unknown): void => {
    push({ severity: 'blocking', scope: 'lighthouse', url: b.url, field: `lighthouse.${b.template}.${field}`, baseline, target });
  };
  for (const [cat, score] of Object.entries(b.scores)) {
    const ts = t.scores[cat];
    if (score == null || ts == null) continue;
    const allowed = cat === 'seo' ? 0 : tol.scoreDrop; // SEO : jamais en dessous
    if (ts < score - allowed - 1e-9) reg(`score.${cat}`, score, ts);
  }
  const m = (k: string): [number | null | undefined, number | null | undefined] => [b.metrics[k], t.metrics[k]];
  const [lcpB, lcpT] = m('largest-contentful-paint');
  if (lcpB != null && lcpT != null && lcpT > lcpB * tol.lcpRatio) reg('LCP', lcpB, lcpT);
  const [fcpB, fcpT] = m('first-contentful-paint');
  if (fcpB != null && fcpT != null && fcpT > fcpB * tol.fcpRatio) reg('FCP', fcpB, fcpT);
  const [tbtB, tbtT] = m('total-blocking-time');
  if (tbtB != null && tbtT != null && tbtT > tbtB * tol.tbtRatio && tbtT - tbtB > tol.tbtMinDeltaMs) reg('TBT', tbtB, tbtT);
  const [clsB, clsT] = m('cumulative-layout-shift');
  if (clsB != null && clsT != null && clsT > clsB + tol.clsDelta) reg('CLS', clsB, clsT);
  for (const audit of t.failedSeoAudits) if (!b.failedSeoAudits.includes(audit)) reg(`seo-audit.${audit}`, 'passed', 'failed');
}

export function applyExceptions(diffs: Diff[], exceptions: ParityException[]): Diff[] {
  return diffs.map((d) => {
    const ex = exceptions.find((e) => globMatch(e.url, d.url) && d.field.startsWith(e.field));
    return ex ? { ...d, exception: ex.reason } : d;
  });
}

export function hasBlocking(diffs: Diff[]): boolean {
  return diffs.some((d) => d.severity === 'blocking' && !d.exception);
}

// ── Utilitaires ───────────────────────────────────────────────────────────

function eq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function union<T>(a: Iterable<T>, b: Iterable<T>): T[] {
  return [...new Set([...a, ...b])].sort();
}

function chainOf(r: { chain: { status: number; location: string | null }[] }): string[] {
  return r.chain.map((h) => `${h.status} → ${h.location}`);
}

function normType(value: string | null | undefined): string | null {
  return value ? value.toLowerCase().replace(/\s+/g, '') : null;
}

function normHeader(name: string, value: string | undefined): string | null {
  if (value === undefined) return null;
  return name === 'content-type' ? normType(value) : value;
}

function linkKey(l: { href: string; text: string; rel: string }): string {
  return `${l.href} | « ${l.text} »${l.rel ? ` [${l.rel}]` : ''}`;
}

function imageKey(i: { src: string; alt: string | null }): string {
  return `${i.src} | alt=${i.alt === null ? '(absent)' : `« ${i.alt} »`}`;
}

function countMap(entries: [string, number][]): Record<string, number> {
  return Object.fromEntries(entries.filter(([, n]) => n > 1));
}

function setDiff(field: string, a: string[], b: string[], block: (f: string, b: unknown, t: unknown) => void): void {
  const sa = new Set(a);
  const sb = new Set(b);
  const removed = a.filter((x) => !sb.has(x));
  const added = b.filter((x) => !sa.has(x));
  if (removed.length || added.length) block(field, { removed }, { added });
}

/** Extrait lisible autour du premier écart entre deux textes longs. */
export function textContext(a: string, b: string, radius = 80): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const start = Math.max(0, i - radius);
  return `${start > 0 ? '…' : ''}${a.slice(start, i + radius)}${i + radius < a.length ? '…' : ''} (écart au caractère ${i}, longueur ${a.length})`;
}

function globMatch(pattern: string, value: string): boolean {
  if (pattern === '*') return true;
  if (!pattern.includes('*')) return pattern === value;
  const re = new RegExp('^' + pattern.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
  return re.test(value);
}

/**
 * Valeurs de meta équivalentes pour un navigateur comme pour un moteur, que
 * Next.js écrit d'une seule façon (balises imposées par le framework) :
 * - charset : insensible à la casse (« UTF-8 » = « utf-8 », spécification HTML) ;
 * - viewport : nombres comparés en valeur (« initial-scale=1.0 » = « initial-scale=1 »).
 * Rien d'autre n'est normalisé : tout autre écart reste bloquant.
 */
export function normalizeMetaValue(key: string, value: string): string {
  if (key === 'charset') {
    return value.trim().toLowerCase();
  }
  if (key === 'name:viewport') {
    return value
      .split(',')
      .map((part) => part.trim().replace(/\s*=\s*/, '=').replace(/=(\d+)\.0+$/, '=$1'))
      .join(', ');
  }
  return value;
}
