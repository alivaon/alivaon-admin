import type { Diff } from './compare.ts';
import type { SnapshotData } from './compare.ts';
import type { Manifest, PageRecord } from './types.ts';

const MAX_INFO_LINES = 150;

/** Rapport de comparaison : liste exhaustive des blocages, informations tronquées. */
export function renderCompareReport(diffs: Diff[], baselineLabel: string, targetLabel: string): string {
  const blocking = diffs.filter((d) => d.severity === 'blocking' && !d.exception);
  const excepted = diffs.filter((d) => d.exception);
  const info = diffs.filter((d) => d.severity === 'info' && !d.exception);

  const lines = [
    `# Parité SEO — ${targetLabel} vs ${baselineLabel}`,
    '',
    blocking.length === 0 ? '**✅ Aucun écart bloquant.**' : `**❌ ${blocking.length} écart(s) bloquant(s) — bascule interdite.**`,
    '',
    `| Bloquants | Exceptions validées | Informations |`,
    `|---|---|---|`,
    `| ${blocking.length} | ${excepted.length} | ${info.length} |`,
    '',
  ];

  if (blocking.length) {
    lines.push('## Écarts bloquants', '');
    for (const [url, group] of groupBy(blocking, (d) => d.url)) {
      lines.push(`### ${url}`, '');
      for (const d of group) lines.push(`- **${d.field}**`, `  - référence : \`${fmt(d.baseline)}\``, `  - cible : \`${fmt(d.target)}\``);
      lines.push('');
    }
  }
  if (excepted.length) {
    lines.push('## Écarts couverts par une exception validée', '');
    for (const d of excepted) lines.push(`- ${d.url} — **${d.field}** — _${d.exception}_`);
    lines.push('');
  }
  if (info.length) {
    lines.push('## Informations (non bloquant)', '');
    for (const d of info.slice(0, MAX_INFO_LINES)) lines.push(`- ${d.url} — **${d.field}** : \`${fmt(d.baseline)}\` → \`${fmt(d.target)}\``);
    if (info.length > MAX_INFO_LINES) lines.push(`- … ${info.length - MAX_INFO_LINES} autres (voir diff.json)`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Audit de l'état initial. Ces constats décrivent l'existant : ils ne sont PAS
 * corrigés pendant la migration (parité stricte), mais servent de liste de
 * travail pour les améliorations post-bascule.
 */
export function renderAudit(manifest: Manifest, data: SnapshotData): string {
  const pages = [...data.pages.values()];
  const indexable = pages.filter(isIndexable);
  // Pages qui se déclarent elles-mêmes canoniques : les variantes (pagination,
  // filtres, utm) canonicalisées ailleurs ne comptent pas comme doublons.
  const canonicalSelf = indexable.filter((p) => p.html!.canonicals.length === 1 && p.html!.canonicals[0] === p.url);
  const byUrl = data.pages;
  const lines: string[] = [];
  const section = (title: string, items: string[], empty = 'Aucun.'): void => {
    lines.push(`## ${title} (${items.length})`, '');
    lines.push(...(items.length ? items.map((i) => `- ${i}`) : [empty]), '');
  };

  lines.push(
    `# Relevé SEO — ${manifest.rewrittenTo ?? manifest.origin}`,
    '',
    `Relevé le ${manifest.createdAt} sur \`${manifest.origin}\` (outil ${manifest.tool} ${manifest.toolVersion}, ${manifest.counts.requests} requêtes).`,
    '',
    '| Pages relevées | Indexables | Canoniques | Entrées sitemap | Sondes | Ressources |',
    '|---|---|---|---|---|---|',
    `| ${pages.length} | ${indexable.length} | ${canonicalSelf.length} | ${data.sitemap.size} | ${data.probes.size} | ${data.assets.size} |`,
    '',
    '> Les constats ci-dessous décrivent l’existant. Pendant la migration ils sont **reproduits à l’identique** ; leur correction éventuelle se fera après la bascule, un changement à la fois.',
    '',
  );

  const statusCount = countBy(pages, (p) => String(p.status));
  lines.push('## Codes HTTP des pages', '', ...Object.entries(statusCount).map(([s, n]) => `- ${s} : ${n}`), '');

  section('Pages sans canonical ou avec plusieurs canonical', indexable.filter((p) => p.html!.canonicals.length !== 1).map((p) => `${p.url} → ${JSON.stringify(p.html!.canonicals)}`));
  section(
    'Canonical différent de l’URL de la page',
    indexable.filter((p) => p.html!.canonicals.length === 1 && p.html!.canonicals[0] !== p.url).map((p) => `${p.url} → ${p.html!.canonicals[0]}`),
  );
  section(
    'Canonical pointant vers une URL non-200 ou non relevée',
    indexable.flatMap((p) => p.html!.canonicals.filter((c) => byUrl.get(c)?.status !== 200).map((c) => `${p.url} → ${c} (${byUrl.get(c)?.status ?? 'non relevée'})`)),
  );
  section('Title absent ou multiple', indexable.filter((p) => p.html!.titles.length !== 1 || !p.html!.titles[0]).map((p) => p.url));
  section('Meta description absente', indexable.filter((p) => !p.html!.metas['name:description']?.[0]).map((p) => p.url));
  section('Titles dupliqués', duplicates(canonicalSelf, (p) => p.html!.titles[0] ?? ''));
  section('Descriptions dupliquées', duplicates(canonicalSelf, (p) => p.html!.metas['name:description']?.[0] ?? ''));
  section('Pages sans H1 ou avec plusieurs H1', canonicalSelf.filter((p) => p.html!.headings.filter((h) => h.level === 1).length !== 1).map((p) => `${p.url} (${p.html!.headings.filter((h) => h.level === 1).length} H1)`));

  // Réciprocité hreflang : si A annonce B pour une langue, B doit annoncer A.
  const hreflangIssues: string[] = [];
  for (const p of canonicalSelf) {
    for (const alt of p.html!.hreflang) {
      if (alt.hreflang === 'x-default' || alt.href === p.url) continue;
      const other = byUrl.get(alt.href);
      if (!other?.html) hreflangIssues.push(`${p.url} annonce ${alt.hreflang} → ${alt.href} (${other?.status ?? 'non relevée'})`);
      else if (!other.html.hreflang.some((h) => h.href === p.url)) hreflangIssues.push(`${p.url} ↔ ${alt.href} : lien retour absent`);
    }
  }
  section('Hreflang non réciproques ou cassés', hreflangIssues);

  const sitemapLocs = new Set(data.sitemap.keys());
  section('Entrées de sitemap non-200 ou redirigées', [...sitemapLocs].filter((l) => byUrl.get(l)?.status !== 200 || byUrl.get(l)?.chain.length).map((l) => `${l} (${byUrl.get(l)?.status ?? 'non relevée'})`));
  section('Pages canoniques absentes du sitemap', canonicalSelf.filter((p) => !sitemapLocs.has(p.url)).map((p) => p.url));

  const brokenLinks = new Map<string, Set<string>>();
  for (const p of pages) {
    for (const l of p.html?.links ?? []) {
      const tgt = byUrl.get(l.href);
      if (tgt && (tgt.status !== 200 || tgt.chain.length)) (brokenLinks.get(l.href) ?? brokenLinks.set(l.href, new Set()).get(l.href)!).add(p.url);
    }
  }
  section(
    'Liens internes vers une URL en erreur ou redirigée',
    [...brokenLinks].map(([href, from]) => `${href} (${byUrl.get(href)!.chain.length ? `${byUrl.get(href)!.chain[0]!.status} → ${byUrl.get(href)!.finalUrl}` : byUrl.get(href)!.status}) — depuis ${from.size} page(s)`),
  );
  section('Images sans attribut alt', [...new Set(indexable.flatMap((p) => p.html!.images.filter((i) => i.alt === null).map((i) => i.src)))]);
  section('Ressources référencées en erreur', [...data.assets.values()].filter((a) => a.status !== 200).map((a) => `${a.url} (${a.status}, ${a.referencedBy} réf.)`));

  lines.push('## Données structurées (JSON-LD) par page', '');
  for (const p of indexable.filter((p) => p.html!.jsonLd.length)) lines.push(`- ${p.url} : ${p.html!.jsonLd.map(ldTypes).join(', ')}`);
  lines.push('');

  lines.push('## Sondes techniques', '', '| Sonde | URL | Code | Redirection finale |', '|---|---|---|---|');
  for (const pr of data.probes.values()) lines.push(`| ${pr.name} | ${pr.url} | ${pr.chain[0]?.status ?? pr.status} | ${pr.chain.length ? `${pr.finalUrl} (${pr.status})` : ''} |`);
  lines.push('');

  return lines.join('\n');
}

export function isIndexable(p: PageRecord): boolean {
  if (p.status !== 200 || p.chain.length || !p.html) return false;
  const robots = [...(p.html.metas['name:robots'] ?? []), p.headers['x-robots-tag'] ?? ''].join(',').toLowerCase();
  return !robots.includes('noindex');
}

function ldTypes(ld: unknown): string {
  const types = new Set<string>();
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      const t = (v as Record<string, unknown>)['@type'];
      if (typeof t === 'string') types.add(t);
      Object.values(v).forEach(walk);
    }
  };
  walk(ld);
  return [...types].join('+') || '(sans @type)';
}

function duplicates(pages: PageRecord[], key: (p: PageRecord) => string): string[] {
  const groups = groupBy(pages.filter((p) => key(p)), key);
  return [...groups].filter(([, g]) => g.length > 1).map(([k, g]) => `« ${k} » : ${g.map((p) => p.url).join(', ')}`);
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) (map.get(key(item)) ?? map.set(key(item), []).get(key(item))!).push(item);
  return map;
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return out;
}

function fmt(value: unknown): string {
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  return (s ?? 'null').replace(/`/g, "'").slice(0, 600);
}
