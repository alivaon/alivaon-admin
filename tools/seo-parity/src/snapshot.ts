import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { extractPage } from './extract.ts';
import { Fetcher } from './fetcher.ts';
import { absUrl, fileNameForUrl, maskRunDate, rewriteOrigins, sameOrigin } from './normalize.ts';
import { buildProbes } from './probes.ts';
import { parseSitemap } from './sitemap.ts';
import type { AssetRecord, DiscoverySource, FileRecord, Manifest, PageRecord, ProbeRecord, SitemapEntry } from './types.ts';

export const TOOL_VERSION = '1.1.0';

export interface SnapshotOptions {
  origin: string;
  rewriteTo: string | null;
  outDir: string;
  basicAuth?: string;
  seedFiles: string[];
  legacyFile: string | null;
  seedsFromSnapshot: string | null;
  concurrency: number;
  delayMs: number;
  maxUrls: number;
  maxQueryVariantsPerPath: number;
  log: (message: string) => void;
}

/** Préfixes jamais crawlés comme pages (fichiers, back-office, techniques). */
const EXCLUDED_PREFIXES = ['/admin', '/login', '/logout', '/uploads/', '/build/', '/bundles/', '/media/', '/vandor/', '/assets/', '/_next/', '/api/', '/index.php', '/adminer.php', '/_profiler', '/_wdt'];
const FILE_EXTENSION = /\.(jpe?g|png|gif|webp|avif|svg|ico|pdf|docx?|zip|css|js|mjs|map|xml|txt|json|woff2?|ttf|otf|eot|mp4|webm|mp3)$/i;
const HTML_TYPE = /text\/html|application\/xhtml\+xml/i;
const WELL_KNOWN_FILES = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/favicon.ico'];

export async function takeSnapshot(opts: SnapshotOptions): Promise<Manifest> {
  const origin = new URL(opts.origin).origin;
  const host = new URL(origin).hostname;
  const fetcher = new Fetcher({
    userAgent: 'AlivaonSEOParity/1.0 (+relevé de référence migration Next.js)',
    basicAuth: opts.basicAuth,
    authHosts: [host, host.replace(/^www\./, '')],
    concurrency: opts.concurrency,
    delayMs: opts.delayMs,
    timeoutMs: 30_000,
    maxRedirects: 10,
  });

  // ── 1. Fichiers connus + sitemaps ─────────────────────────────────────────
  opts.log('Fichiers racine (robots, sitemap, llms, favicon)…');
  const files: FileRecord[] = [];
  const fileQueue = [...WELL_KNOWN_FILES];
  const sitemapEntries: SitemapEntry[] = [];
  for (let i = 0; i < fileQueue.length; i++) {
    const path = fileQueue[i]!;
    const res = await fetcher.fetch(origin + path);
    files.push({ path, status: res.status, contentType: res.headers['content-type'] ?? null, sha256: res.bodySha256, text: res.body });
    if (path === '/robots.txt' && res.body) {
      for (const line of res.body.split('\n')) {
        const match = /^sitemap:\s*(\S+)/i.exec(line.trim());
        if (match?.[1]) {
          const p = new URL(match[1]).pathname;
          if (!fileQueue.includes(p) && sameOrigin(match[1], origin)) fileQueue.push(p);
        }
      }
    }
    if (/sitemap.*\.xml$/.test(path) && res.body && res.status === 200) {
      const parsed = parseSitemap(res.body);
      sitemapEntries.push(...parsed.entries);
      for (const child of parsed.children) {
        const p = new URL(child).pathname;
        if (!fileQueue.includes(p)) fileQueue.push(p);
      }
    }
  }
  opts.log(`  ${sitemapEntries.length} entrées de sitemap`);

  // ── 2. Graines ────────────────────────────────────────────────────────────
  const sources = new Map<string, Set<DiscoverySource>>();
  const queue: string[] = [];
  const queryVariants = new Map<string, number>();
  const inlinks = new Map<string, Set<string>>();

  const enqueue = (url: string, source: DiscoverySource): void => {
    if (!isCrawlable(url, origin)) return;
    const known = sources.get(url);
    if (known) {
      known.add(source);
      return;
    }
    const parsed = new URL(url);
    if (parsed.search) {
      const n = queryVariants.get(parsed.pathname) ?? 0;
      if (n >= opts.maxQueryVariantsPerPath && source === 'link') return;
      queryVariants.set(parsed.pathname, n + 1);
    }
    if (sources.size >= opts.maxUrls) return;
    sources.set(url, new Set([source]));
    queue.push(url);
  };

  enqueue(`${origin}/`, 'seed');
  for (const entry of sitemapEntries) {
    enqueue(entry.loc, 'sitemap');
    for (const alt of entry.alternates) enqueue(alt.href, 'sitemap-alternate');
  }
  for (const file of opts.seedFiles) {
    for (const line of await readLines(file)) {
      const url = absUrl(line, origin);
      if (url) enqueue(url, 'seed');
    }
  }
  if (opts.seedsFromSnapshot) {
    const baselineManifest = JSON.parse(await readFile(join(opts.seedsFromSnapshot, 'manifest.json'), 'utf8')) as Manifest;
    const baselineOrigin = baselineManifest.rewrittenTo ?? baselineManifest.origin;
    const index = JSON.parse(await readFile(join(opts.seedsFromSnapshot, 'pages.index.json'), 'utf8')) as { url: string }[];
    for (const { url } of index) enqueue(rewriteOrigins(url, baselineOrigin, origin), 'baseline');
  }

  // ── 3. Crawl ──────────────────────────────────────────────────────────────
  opts.log('Crawl des pages…');
  const pages: PageRecord[] = [];
  const runDate = new Date();
  const worker = async (): Promise<void> => {
    while (queue.length) {
      const url = queue.shift()!;
      const res = await fetcher.fetch(url);
      const isHtml = res.status === 200 && HTML_TYPE.test(res.headers['content-type'] ?? '');
      // Une URL qui redirige n'a pas de contenu propre : sa cible est relevée à part.
      const html = isHtml && res.body && res.chain.length === 0 ? extractPage(res.body, res.finalUrl) : null;
      if (html) html.text = maskRunDate(html.text, runDate);
      pages.push({ url, discoveredVia: [], inlinks: 0, status: res.status, chain: res.chain, finalUrl: res.finalUrl, headers: res.headers, html, ...(res.error ? { error: res.error } : {}) });

      if (res.chain.length && res.finalUrl !== url) enqueue(res.finalUrl, 'redirect');
      if (html) {
        for (const link of html.links) {
          if (!sameOrigin(link.href, origin)) continue;
          (inlinks.get(link.href) ?? inlinks.set(link.href, new Set()).get(link.href)!).add(url);
          enqueue(link.href, 'link');
        }
      }
      if (pages.length % 25 === 0) opts.log(`  ${pages.length} pages (${queue.length} en file)`);
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency }, worker));
  for (const page of pages) {
    page.discoveredVia = [...(sources.get(page.url) ?? [])].sort();
    page.inlinks = inlinks.get(page.url)?.size ?? 0;
  }
  pages.sort((a, b) => a.url.localeCompare(b.url));
  opts.log(`  ${pages.length} pages relevées`);

  // ── 4. Sondes ─────────────────────────────────────────────────────────────
  const legacy = opts.legacyFile ? await readLines(opts.legacyFile) : [];
  const probeSpecs = buildProbes(origin, sitemapEntries.map((e) => e.loc), legacy);
  opts.log(`Sondes techniques (${probeSpecs.length})…`);
  const probes: ProbeRecord[] = await Promise.all(
    probeSpecs.map(async (spec) => {
      const res = await fetcher.fetch(spec.url, { readBody: false });
      return { name: spec.name, url: spec.url, status: res.status, chain: res.chain, finalUrl: res.finalUrl, headers: pickProbeHeaders(res.headers), ...(res.error ? { error: res.error } : {}) };
    }),
  );
  probes.sort((a, b) => a.name.localeCompare(b.name));

  // ── 5. Ressources référencées (images, og:image, icônes) ─────────────────
  const assetRefs = new Map<string, number>();
  const addAsset = (url: string | null | undefined): void => {
    if (url && sameOrigin(url, origin)) assetRefs.set(url, (assetRefs.get(url) ?? 0) + 1);
  };
  for (const page of pages) {
    if (!page.html) continue;
    page.html.images.forEach((i) => addAsset(i.src));
    page.html.bgImages.forEach(addAsset);
    for (const key of ['property:og:image', 'property:og:image:secure_url', 'name:twitter:image']) page.html.metas[key]?.forEach(addAsset);
    page.html.headLinks.filter((l) => /icon|manifest/.test(l.rel)).forEach((l) => addAsset(l.href));
  }
  opts.log(`Ressources référencées (${assetRefs.size})…`);
  const assets: AssetRecord[] = await Promise.all(
    [...assetRefs].map(async ([url, referencedBy]) => {
      const res = await fetcher.fetch(url, { readBody: false });
      return { url, status: res.status, contentType: res.headers['content-type'] ?? null, finalUrl: res.finalUrl, referencedBy };
    }),
  );
  assets.sort((a, b) => a.url.localeCompare(b.url));

  // ── 6. Écriture ───────────────────────────────────────────────────────────
  const manifest: Manifest = {
    tool: '@alivaon/seo-parity',
    toolVersion: TOOL_VERSION,
    createdAt: new Date().toISOString(),
    origin,
    rewrittenTo: opts.rewriteTo ? new URL(opts.rewriteTo).origin : null,
    counts: { pages: pages.length, probes: probes.length, sitemapEntries: sitemapEntries.length, assets: assets.length, files: files.length, requests: fetcher.requestCount },
    options: { concurrency: opts.concurrency, delayMs: opts.delayMs, maxUrls: opts.maxUrls, maxQueryVariantsPerPath: opts.maxQueryVariantsPerPath, seedFiles: opts.seedFiles.length, seedsFromSnapshot: Boolean(opts.seedsFromSnapshot) },
  };

  await writeSnapshot(opts.outDir, manifest, { pages, probes, sitemapEntries, files, assets });
  return manifest;
}

async function writeSnapshot(
  outDir: string,
  manifest: Manifest,
  data: { pages: PageRecord[]; probes: ProbeRecord[]; sitemapEntries: SitemapEntry[]; files: FileRecord[]; assets: AssetRecord[] },
): Promise<void> {
  const rewrite = (value: unknown): string => rewriteOrigins(JSON.stringify(value, null, 2) + '\n', manifest.origin, manifest.rewrittenTo);

  await rm(join(outDir, 'pages'), { recursive: true, force: true });
  await rm(join(outDir, 'files'), { recursive: true, force: true });
  await mkdir(join(outDir, 'pages'), { recursive: true });
  await mkdir(join(outDir, 'files'), { recursive: true });

  const index = [];
  for (const page of data.pages) {
    const stored = JSON.parse(rewrite(page)) as PageRecord;
    const file = fileNameForUrl(stored.url);
    await writeFile(join(outDir, 'pages', file), JSON.stringify(stored, null, 2) + '\n');
    index.push({ url: stored.url, file, status: stored.status, finalUrl: stored.finalUrl, discoveredVia: stored.discoveredVia, inlinks: stored.inlinks });
  }

  for (const file of data.files) {
    // Seul un fichier réellement servi est archivé (pas la page d'erreur d'un 404).
    if (file.text !== null && file.status === 200) await writeFile(join(outDir, 'files', file.path.replace(/^\//, '').replace(/\//g, '__')), rewriteOrigins(file.text, manifest.origin, manifest.rewrittenTo));
  }

  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(outDir, 'pages.index.json'), JSON.stringify(index, null, 2) + '\n');
  await writeFile(join(outDir, 'probes.json'), rewrite(data.probes));
  await writeFile(join(outDir, 'sitemap.json'), rewrite([...data.sitemapEntries].sort((a, b) => a.loc.localeCompare(b.loc))));
  await writeFile(join(outDir, 'files.json'), rewrite(data.files.map(({ text: _text, ...rest }) => rest)));
  await writeFile(join(outDir, 'assets.json'), rewrite(data.assets));
}

function isCrawlable(url: string, origin: string): boolean {
  if (!sameOrigin(url, origin)) return false;
  const { pathname } = new URL(url);
  if (EXCLUDED_PREFIXES.some((p) => pathname === p.replace(/\/$/, '') || pathname.startsWith(p))) return false;
  return !FILE_EXTENSION.test(pathname);
}

/** Sur une sonde, seuls les en-têtes qui décrivent le comportement d'URL sont utiles. */
function pickProbeHeaders(headers: Record<string, string>): Record<string, string> {
  const keep = ['content-type', 'location', 'x-robots-tag', 'content-language', 'www-authenticate'];
  return Object.fromEntries(Object.entries(headers).filter(([k]) => keep.includes(k)));
}

async function readLines(file: string): Promise<string[]> {
  const content = await readFile(file, 'utf8');
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('#'));
}
