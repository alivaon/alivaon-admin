import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { compareSnapshots, hasBlocking, loadSnapshot, type ParityException } from './compare.ts';
import { runLighthouse } from './lighthouse.ts';
import { renderAudit, renderCompareReport } from './report.ts';
import { takeSnapshot } from './snapshot.ts';
import type { Manifest } from './types.ts';

const TOOL_DIR = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(TOOL_DIR, '../..');
const BASELINE_ROOT = join(REPO_ROOT, 'tests/seo-baseline');

const USAGE = `Usage :
  snapshot   --origin <url> [--label <nom>] [--rewrite-to <url>] [--seeds-from <dossier>]
             [--seeds <fichier>]… [--concurrency 2] [--delay 300] [--max-urls 3000]
  lighthouse --label <nom> [--runs 3] [--all-locales]
  compare    --baseline <nom> --target <nom> [--exceptions <fichier>]

Les dossiers sont relatifs à tests/seo-baseline/. Accès BasicAuth (staging) : variable SEO_BASIC_AUTH="user:motdepasse".`;

async function main(): Promise<number> {
  const [command, ...rest] = process.argv.slice(2);
  const { values } = parseArgs({
    args: rest,
    options: {
      origin: { type: 'string' },
      label: { type: 'string' },
      'rewrite-to': { type: 'string' },
      'seeds-from': { type: 'string' },
      seeds: { type: 'string', multiple: true },
      concurrency: { type: 'string', default: '2' },
      delay: { type: 'string', default: '300' },
      'max-urls': { type: 'string', default: '3000' },
      runs: { type: 'string', default: '3' },
      'all-locales': { type: 'boolean', default: false },
      baseline: { type: 'string' },
      target: { type: 'string' },
      exceptions: { type: 'string' },
    },
  });
  const basicAuth = process.env.SEO_BASIC_AUTH || undefined;
  const log = (m: string): void => console.log(m);
  const dirOf = (label: string): string => resolve(BASELINE_ROOT, label);

  if (command === 'snapshot') {
    if (!values.origin) throw new Error('--origin requis');
    const label = values.label ?? `${new URL(values.origin).hostname}-${new Date().toISOString().slice(0, 10)}`;
    const outDir = dirOf(label);
    log(`Relevé de ${values.origin} → ${outDir}`);
    const manifest = await takeSnapshot({
      origin: values.origin,
      rewriteTo: values['rewrite-to'] ?? null,
      outDir,
      basicAuth,
      seedFiles: [join(TOOL_DIR, 'seeds/extra-urls.txt'), ...(values.seeds ?? []).map((s) => resolve(s))],
      legacyFile: join(TOOL_DIR, 'seeds/legacy-redirects.txt'),
      seedsFromSnapshot: values['seeds-from'] ? dirOf(values['seeds-from']) : null,
      concurrency: Number(values.concurrency),
      delayMs: Number(values.delay),
      maxUrls: Number(values['max-urls']),
      maxQueryVariantsPerPath: 20,
      log,
    });
    await writeFile(join(outDir, 'README.md'), renderAudit(manifest, await loadSnapshot(outDir)));
    log(`Terminé : ${JSON.stringify(manifest.counts)}`);
    log(`Audit de l'état initial : ${join(outDir, 'README.md')}`);
    return 0;
  }

  if (command === 'lighthouse') {
    if (!values.label) throw new Error('--label requis');
    const dir = dirOf(values.label);
    const manifest = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8')) as Manifest;
    log(`Lighthouse (mobile, ${values.runs} runs par gabarit, médiane)…`);
    const summaries = await runLighthouse({ dir, manifest, data: await loadSnapshot(dir), runs: Number(values.runs), allLocales: values['all-locales'], basicAuth, log });
    for (const s of summaries) log(`  ${s.template.padEnd(22)} perf ${s.scores.performance} · seo ${s.scores.seo} · LCP ${Math.round(s.metrics['largest-contentful-paint'] ?? 0)} ms · CLS ${s.metrics['cumulative-layout-shift']}`);
    return 0;
  }

  if (command === 'compare') {
    if (!values.baseline || !values.target) throw new Error('--baseline et --target requis');
    const exceptionsFile = values.exceptions ? resolve(values.exceptions) : join(TOOL_DIR, 'exceptions.json');
    const exceptions = existsSync(exceptionsFile) ? (JSON.parse(await readFile(exceptionsFile, 'utf8')) as ParityException[]) : [];
    for (const ex of exceptions) if (!ex.reason?.trim()) throw new Error(`Exception sans motif : ${JSON.stringify(ex)}`);

    const diffs = compareSnapshots(await loadSnapshot(dirOf(values.baseline)), await loadSnapshot(dirOf(values.target)), exceptions);
    const targetDir = dirOf(values.target);
    await writeFile(join(targetDir, 'diff.json'), JSON.stringify(diffs, null, 2) + '\n');
    await writeFile(join(targetDir, 'parity-report.md'), renderCompareReport(diffs, values.baseline, values.target));
    log(`Rapport : ${join(targetDir, 'parity-report.md')}`);
    const blocking = hasBlocking(diffs);
    log(blocking ? '❌ Écarts bloquants détectés.' : '✅ Parité respectée.');
    return blocking ? 1 : 0;
  }

  console.log(USAGE);
  return command ? 2 : 0;
}

main().then(
  (code) => process.exit(code),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(2);
  },
);
