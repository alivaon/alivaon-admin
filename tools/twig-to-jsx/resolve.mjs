#!/usr/bin/env node
/**
 * Résout la structure de contrôle Twig laissée en « TODO twig » par
 * convert.mjs --raw : if/elseif/else, for/else, expressions. Les expressions
 * et conditions sont traduites par une table fournie (JSON) :
 *   { "expr": { "<twig>": "<js>" }, "cond": { "<twig>": "<js>" },
 *     "for": { "<var> in <liste>": "<js liste>" } }
 * Variables de boucle : loop.index → (i + 1), loop.index0 → i, loop.first,
 * loop.last. Toute expression absente de la table est signalée (sortie 1) :
 * rien n'est deviné. Usage : node resolve.mjs <brut.jsx> <table.json>
 */
import { readFileSync } from 'node:fs';

const [file, tableFile] = process.argv.slice(2);
let src = readFileSync(file, 'utf8').trim();
const table = JSON.parse(readFileSync(tableFile, 'utf8'));
const missing = new Set();

// HTML brut (|raw) : « RAW:<js> » dans la table. L'élément dont c'est tout le
// contenu reçoit dangerouslySetInnerHTML (même HTML qu'en Twig).
src = src.replace(/<([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)>\s*\{\/\* TODO twig(?: raw)?: ([\s\S]*?) \*\/\}\s*<\/\1>/g, (all, tag, attrs, twig) => {
  const key = twig.trim().replace(/\s+/g, ' ');
  const js = table.expr?.[key];
  return typeof js === 'string' && js.startsWith('RAW:') ? `<${tag}${attrs} dangerouslySetInnerHTML={{ __html: ${js.slice(4)} }} />` : all;
});

const TOKEN = /\{\/\* TODO twig(?: raw)?: ([\s\S]*?) \*\/(?: '')?\}|\$\{\/\* TODO twig: ([\s\S]*?) \*\/ ''\}|\{\/\* TODO twig: ([\s\S]*?) \*\/ ''\}/g;

// Pile des boucles ouvertes (pour loop.*).
const loops = [];
function loopExpr(expr) {
  const top = loops.at(-1);
  if (!top) return null;
  const i = top.index;
  const map = { 'loop.index': `(${i} + 1)`, 'loop.index0': i, 'loop.first': `${i} === 0`, 'loop.last': `${i} === ${top.list}.length - 1`, 'not loop.first': `${i} !== 0`, 'not loop.last': `${i} !== ${top.list}.length - 1` };
  return map[expr] ?? null;
}

function translate(kind, twig) {
  const key = twig.trim().replace(/\s+/g, ' ');
  const fromLoop = loopExpr(key);
  if (fromLoop !== null) return String(fromLoop);
  const js = table[kind]?.[key];
  if (typeof js === 'string' && js.startsWith('RAW:')) {
    missing.add(`${kind} (|raw hors d'un élément seul) : ${key}`);
    return 'MISSING';
  }
  if (js === undefined) {
    missing.add(`${kind}: ${key}`);
    return `MISSING`;
  }
  return js;
}

/** Découpe en jetons : texte, et instructions Twig. */
const parts = [];
let last = 0;
for (const m of src.matchAll(TOKEN)) {
  parts.push({ type: 'text', value: src.slice(last, m.index) });
  const body = (m[1] ?? m[2] ?? m[3]).trim();
  const inAttr = m[0].startsWith('${') ? 'tpl' : m[0].endsWith(" ''}") ? 'attr' : null;
  parts.push({ type: 'twig', value: body, inAttr });
  last = m.index + m[0].length;
}
parts.push({ type: 'text', value: src.slice(last) });

/** Arbre : if/for avec branches. */
function parse(i = 0, stop = []) {
  const nodes = [];
  while (i < parts.length) {
    const p = parts[i];
    if (p.type === 'twig' && !p.inAttr) {
      const m = /^(if|elseif|else|endif|for|endfor|set|endset)\b\s*([\s\S]*)$/.exec(p.value);
      if (m && stop.includes(m[1])) return { nodes, i, stopped: m[1], arg: m[2] };
      if (m && m[1] === 'if') {
        const branches = [];
        let cond = m[2];
        let j = i + 1;
        for (;;) {
          const r = parse(j, ['elseif', 'else', 'endif']);
          branches.push({ cond, nodes: r.nodes });
          j = r.i + 1;
          if (r.stopped === 'endif') break;
          cond = r.stopped === 'elseif' ? r.arg : null;
        }
        nodes.push({ type: 'if', branches });
        i = j;
        continue;
      }
      if (m && m[1] === 'for') {
        const r = parse(i + 1, ['else', 'endfor']);
        let elseNodes = null;
        let j = r.i + 1;
        if (r.stopped === 'else') {
          const r2 = parse(j, ['endfor']);
          elseNodes = r2.nodes;
          j = r2.i + 1;
        }
        nodes.push({ type: 'for', header: m[2], body: r.nodes, elseNodes });
        i = j;
        continue;
      }
    }
    nodes.push(p);
    i++;
  }
  return { nodes, i, stopped: null };
}

let loopId = 0;
function render(nodes) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'text') out += n.value;
    else if (n.type === 'twig') {
      const js = translate('expr', n.value);
      out += n.inAttr === 'tpl' ? `\${${js}}` : `{${js}}`;
    } else if (n.type === 'if') {
      let expr = '';
      let closing = '';
      n.branches.forEach((b, k) => {
        const body = `(\n<>\n${render(b.nodes)}\n</>\n)`;
        if (b.cond === null) {
          expr += body;
          closing = '';
        } else {
          expr += `${k > 0 ? '' : ''}(${translate('cond', b.cond)}) ? ${body} : `;
          closing = 'null';
        }
      });
      out += `{${expr}${closing}}`;
    } else if (n.type === 'for') {
      const m = /^(\w+)(?:\s*,\s*(\w+))?\s+in\s+([\s\S]+)$/.exec(n.header.trim());
      const list = translate('for', n.header);
      const index = `i${loopId++}`;
      loops.push({ index, list });
      const item = m ? (m[2] ? `[${m[1]}, ${m[2]}]` : m[1]) : 'item';
      const body = render(n.body);
      loops.pop();
      const mapped = `(${list}).map((${item}, ${index}) => (\n<Fragment key={${index}}>\n${body}\n</Fragment>\n))`;
      out += n.elseNodes ? `{(${list}).length > 0 ? ${mapped} : (\n<>\n${render(n.elseNodes)}\n</>\n)}` : `{${mapped}}`;
    }
  }
  return out;
}

const tree = parse();
const result = render(tree.nodes);
if (missing.size > 0) {
  console.error(`Expressions à traduire (${missing.size}) :\n${[...missing].map((m) => `  ${m}`).join('\n')}`);
  process.exit(1);
}
process.stdout.write(result + '\n');
