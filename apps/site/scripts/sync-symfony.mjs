#!/usr/bin/env node
/**
 * Recopie depuis alivaon-symfony ce qui fait foi pour le site public :
 * - catalogues de traduction messages.{fr,en}.xlf → src/generated/messages.{fr,en}.json
 * - table des routes publiques (chemins FR/EN, redirections) → src/generated/routes.json
 *
 * Symfony reste la source des textes et des URLs : le site Next ne les
 * réécrit jamais à la main (parité SEO par construction).
 *
 * Usage : pnpm --filter @alivaon/site sync   (SYMFONY_DIR pour un autre chemin)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const here = import.meta.dirname;
const symfonyDir = resolve(process.env.SYMFONY_DIR ?? `${here}/../../../../alivaon-symfony`);
const out = (file) => resolve(here, '../src/generated', file);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (value) =>
  value.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos);/gi, (_, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()],
  );

function catalog(locale) {
  const xml = readFileSync(`${symfonyDir}/translations/messages.${locale}.xlf`, 'utf8');
  const messages = {};
  for (const [, name, target] of xml.matchAll(/<unit\b[^>]*\bname="([^"]+)"[^>]*>[\s\S]*?<target>([\s\S]*?)<\/target>/g)) {
    messages[decode(name)] = decode(target);
  }
  return Object.fromEntries(Object.entries(messages).sort(([a], [b]) => a.localeCompare(b)));
}

function routes() {
  const json = execFileSync('php', ['bin/console', 'debug:router', '--format=json'], { cwd: symfonyDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const all = JSON.parse(json);
  const paths = {};
  const redirects = [];
  for (const [name, route] of Object.entries(all)) {
    const localized = /^(app_[a-z_]+)\.(fr|en)$/.exec(name);
    if (localized && !/login|logout|invitation|admin/.test(name)) {
      (paths[localized[1]] ??= {})[localized[2]] = route.path;
    } else if (route.defaults?._controller?.includes('RedirectController::urlRedirectAction')) {
      redirects.push({ from: route.path, to: route.defaults.path, permanent: route.defaults.permanent === true });
    } else if (name === 'sitemap' || name === 'robots') {
      (paths[name] ??= {}).fr = route.path;
    }
  }
  return { paths: Object.fromEntries(Object.entries(paths).sort(([a], [b]) => a.localeCompare(b))), redirects };
}

for (const locale of ['fr', 'en']) {
  const messages = catalog(locale);
  writeFileSync(out(`messages.${locale}.json`), `${JSON.stringify(messages, null, 2)}\n`);
  console.log(`messages.${locale}.json : ${Object.keys(messages).length} clés`);
}
const table = routes();
writeFileSync(out('routes.json'), `${JSON.stringify(table, null, 2)}\n`);
console.log(`routes.json : ${Object.keys(table.paths).length} routes, ${table.redirects.length} redirection(s)`);
