#!/usr/bin/env node
/**
 * Aide au portage des gabarits Twig du site Symfony en JSX (phase 4).
 * Convertit la partie mécanique d'un bloc Twig ; tout ce qui demande un
 * jugement (boucles, conditions, variables) est laissé en « TODO twig » et
 * se termine à la main. Le résultat est ensuite vérifié par le contrôle de
 * parité SEO, jamais pris tel quel.
 *
 * Usage : node tools/twig-to-jsx/convert.mjs <gabarit.twig> [bloc=body]
 */
import { readFileSync } from 'node:fs';

const [file, block = 'body'] = process.argv.slice(2);
const source = readFileSync(file, 'utf8');

function extractBlock(text, name) {
  const start = text.search(new RegExp(`{%-?\\s*block\\s+${name}\\s*-?%}`));
  if (start < 0) throw new Error(`Bloc ${name} introuvable`);
  let depth = 0;
  const re = /{%-?\s*(block\s+\w+|endblock)\b[^%]*-?%}/g;
  re.lastIndex = start;
  let m;
  let contentStart = -1;
  while ((m = re.exec(text))) {
    if (m[1].startsWith('block')) {
      depth++;
      if (depth === 1) contentStart = m.index + m[0].length;
    } else if (--depth === 0) {
      return text.slice(contentStart, m.index);
    }
  }
  throw new Error('endblock manquant');
}

const SVG_ATTRS = ['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'fill-rule', 'fill-opacity', 'clip-path', 'clip-rule', 'stop-color', 'stop-opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'xlink:href', 'xml:space', 'color-interpolation-filters', 'flood-opacity', 'flood-color'];
const RENAMES = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete', novalidate: 'noValidate', colspan: 'colSpan', rowspan: 'rowSpan', frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', crossorigin: 'crossOrigin', srcset: 'srcSet', enctype: 'encType', hreflang: 'hrefLang', 'accept-charset': 'acceptCharset', 'http-equiv': 'httpEquiv', itemprop: 'itemProp', itemscope: 'itemScope', itemtype: 'itemType', viewbox: 'viewBox' };
for (const a of SVG_ATTRS) RENAMES[a] = a.replace(/[-:](\w)/g, (_, c) => c.toUpperCase());
const VOID = new Set(['img', 'input', 'br', 'hr', 'source', 'meta', 'link', 'area', 'col', 'embed', 'track', 'wbr']);

/** Expression Twig → expression JS (cas usuels), sinon null. */
function twigExpr(expr) {
  const e = expr.trim();
  let m;
  if ((m = /^'([^']+)'\s*\|\s*trans(?:\s*\((\{[^}]*\})\s*\))?\s*(\|\s*raw)?$/.exec(e))) {
    const params = m[2] ? `, ${m[2].replace(/'/g, "'")}` : '';
    return { js: `t('${m[1]}'${params})`, raw: Boolean(m[3]) };
  }
  if ((m = /^asset\('([^']+)'\)$/.exec(e))) return { js: `asset('${m[1]}')` };
  if ((m = /^absolute_url\(asset\('([^']+)'\)\)$/.exec(e))) return { js: `absoluteUrl(asset('${m[1]}'))` };
  if ((m = /^path\('([^']+)'\)$/.exec(e))) return { js: `path(locale, '${m[1]}')` };
  if ((m = /^app\.request\.locale$/.exec(e))) return { js: 'locale' };
  return null;
}

let body = extractBlock(source, block)
  .replace(/{#[\s\S]*?#}/g, '')
  .replace(/<!--[\s\S]*?-->/g, '');

// Attributs : name="valeur avec {{ … }}"
body = body.replace(/<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g, (all, tag, attrs, selfClose) => {
  const out = [];
  for (const [, name, , dq, sq] of attrs.matchAll(/\s+([^\s=>\/]+)(=(?:"([^"]*)"|'([^']*)'))?/g)) {
    let value = dq ?? sq;
    const jsxName = RENAMES[name.toLowerCase()] ?? name;
    if (value === undefined) {
      out.push(jsxName);
      continue;
    }
    if (name === 'style') {
      const obj = value.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
        const [k, ...v] = d.split(':');
        const key = k.trim().startsWith('--') ? `'${k.trim()}'` : k.trim().replace(/-(\w)/g, (_, c) => c.toUpperCase());
        return `${key}: '${v.join(':').trim().replace(/'/g, "\\'")}'`;
      });
      out.push(`style=@@RAW(${obj.join(', ')})@@`);
      continue;
    }
    if (value.includes('{{') || value.includes('{%')) {
      const parts = value.split(/({{[\s\S]*?}}|{%[\s\S]*?%})/).filter((p) => p !== '');
      const converted = parts.map((p) => {
        if (p.startsWith('{{')) {
          const r = twigExpr(p.slice(2, -2));
          return r ? { js: r.js } : { js: `/* TODO twig: ${p.slice(2, -2).trim()} */ ''` };
        }
        if (p.startsWith('{%')) return { js: `/* TODO twig: ${p.slice(2, -2).trim()} */ ''` };
        return { text: p };
      });
      if (converted.length === 1 && converted[0].js) {
        out.push(`${jsxName}={${converted[0].js}}`);
      } else {
        out.push(`${jsxName}={\`${converted.map((c) => (c.js ? `\${${c.js}}` : c.text.replace(/`/g, '\\`'))).join('')}\`}`);
      }
      continue;
    }
    out.push(`${jsxName}="${value}"`);
  }
  const close = VOID.has(tag.toLowerCase()) || selfClose ? ' />' : '>';
  return `<${tag}${out.length ? ` ${out.join(' ')}` : ''}${close}`;
});

// Élément dont tout le contenu est {{ …|raw }} → dangerouslySetInnerHTML
body = body.replace(/<([a-zA-Z][\w-]*)([^>]*)>\s*{{([^}]*\|\s*raw)\s*}}\s*<\/\1>/g, (all, tag, attrs, expr) => {
  const r = twigExpr(expr);
  return r ? `<${tag}${attrs} dangerouslySetInnerHTML=@@RAW(${r.js})@@ />` : all;
});

// Expressions et instructions restantes dans le texte
body = body
  .replace(/{{([\s\S]*?)}}/g, (all, expr) => {
    const r = twigExpr(expr);
    if (!r) return `{/* TODO twig: ${expr.trim()} */}`;
    return r.raw ? `{/* TODO twig raw: ${expr.trim()} */}` : `{${r.js}}`;
  })
  .replace(/{%-?([\s\S]*?)-?%}/g, (all, stmt) => `{/* TODO twig: ${stmt.trim()} */}`)
  .replace(/\n{3,}/g, '\n\n')
  .replace(/@@RAW\(([\s\S]*?)\)@@/g, (_, js) => (js.startsWith('t(') ? `{{ __html: ${js} }}` : `{{ ${js} }}`));

process.stdout.write(`<>\n${body.trim()}\n</>\n`);
