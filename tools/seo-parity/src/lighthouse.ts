import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import type { SnapshotData } from './compare.ts';
import { rewriteOrigins } from './normalize.ts';
import { isIndexable } from './report.ts';
import type { LighthouseSummary, Manifest } from './types.ts';

type LighthouseResult = NonNullable<Awaited<ReturnType<typeof lighthouse>>>['lhr'];

const CATEGORIES = ['performance', 'seo', 'accessibility', 'best-practices'];
const METRICS = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
/** Analytics bloqués : ne pas polluer les statistiques de production avec les runs. */
const BLOCKED_URLS = ['*googletagmanager.com*', '*google-analytics.com*', '*analytics.google.com*'];

/** Type de page, pour ne mesurer qu'une URL représentative par gabarit. */
export function templateOf(url: string): string {
  const path = new URL(url).pathname;
  const locale = path === '/en' || path.startsWith('/en/') ? 'en' : 'fr';
  const segments = (locale === 'en' ? path.slice(3) : path).split('/').filter(Boolean);
  if (segments.length === 0) return `${locale}:home`;
  if (segments[0] === 'blog' && (segments[1] === 'category' || segments[1] === 'tag')) return `${locale}:blog-${segments[1]}`;
  return `${locale}:${segments[0]}${segments.length > 1 ? ':detail' : ''}`;
}

export async function runLighthouse(opts: {
  dir: string;
  manifest: Manifest;
  data: SnapshotData;
  runs: number;
  allLocales: boolean;
  basicAuth?: string;
  log: (m: string) => void;
}): Promise<LighthouseSummary[]> {
  const picked = new Map<string, string>();
  for (const page of [...opts.data.pages.values()].filter(isIndexable).sort((a, b) => a.url.localeCompare(b.url))) {
    if (new URL(page.url).search) continue;
    const template = templateOf(page.url);
    const keep = opts.allLocales || template.startsWith('fr:') || template === 'en:home' || template === 'en:blog:detail';
    if (keep && !picked.has(template)) picked.set(template, page.url);
  }

  const rawDir = join(opts.dir, 'lighthouse', 'raw');
  await mkdir(rawDir, { recursive: true });
  const extraHeaders = opts.basicAuth ? { Authorization: 'Basic ' + Buffer.from(opts.basicAuth).toString('base64') } : undefined;

  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-first-run', '--no-default-browser-check'] });
  const summaries: LighthouseSummary[] = [];
  try {
    for (const [template, storedUrl] of [...picked].sort()) {
      // Les URLs stockées sont réécrites vers l'origine de référence : on mesure l'origine réelle.
      const url = rewriteOrigins(storedUrl, opts.manifest.rewrittenTo, opts.manifest.origin);
      const runs: LighthouseResult[] = [];
      for (let i = 1; i <= opts.runs; i++) {
        opts.log(`  ${template} (${i}/${opts.runs}) ${url}`);
        const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: CATEGORIES, blockedUrlPatterns: BLOCKED_URLS, extraHeaders });
        if (!result) throw new Error(`Lighthouse n'a rien renvoyé pour ${url}`);
        await writeFile(join(rawDir, `${template.replace(/:/g, '_')}-${i}.json`), JSON.stringify(result.lhr));
        runs.push(result.lhr);
      }

      const last = runs[runs.length - 1]!;
      const seo = last.categories.seo;
      summaries.push({
        template,
        url: storedUrl,
        runs: runs.length,
        scores: Object.fromEntries(CATEGORIES.map((c) => [c, median(runs.map((r) => r.categories[c]?.score ?? null))])),
        metrics: Object.fromEntries(METRICS.map((m) => [m, median(runs.map((r) => r.audits[m]?.numericValue ?? null))])),
        failedSeoAudits: (seo?.auditRefs ?? []).filter((ref) => ref.weight > 0 && (last.audits[ref.id]?.score ?? 1) < 1).map((ref) => ref.id).sort(),
      });
    }
  } finally {
    chrome.kill();
  }

  await writeFile(join(opts.dir, 'lighthouse', 'summary.json'), JSON.stringify(summaries, null, 2) + '\n');
  return summaries;
}

function median(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number').sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  const value = nums.length % 2 ? nums[mid]! : (nums[mid - 1]! + nums[mid]!) / 2;
  return Math.round(value * 1000) / 1000;
}
