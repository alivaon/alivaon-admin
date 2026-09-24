#!/usr/bin/env node
/**
 * Rend explicites, dans des fichiers TSX, les blancs qu'HTML affiche et que
 * JSX supprime. En HTML, un retour à la ligne entre « Totale</span> » et
 * « Suivi » s'affiche comme une espace ; en JSX, il disparaît : « TotaleSuivi ».
 *
 * Pour chaque texte JSX contenant un retour à la ligne, ses blancs de début et
 * de fin (et un texte fait uniquement de blancs) deviennent {' '} lorsque le
 * voisin concerné n'est pas un élément de bloc (où le blanc serait invisible).
 * Idempotent. Usage : node tools/twig-to-jsx/jsx-whitespace.mjs <fichier.tsx>…
 */
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

const BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'br', 'dd', 'details', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer',
  'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'iframe', 'legend', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section',
  'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'html', 'head', 'body', 'style', 'script',
  // Contenu SVG : les blancs n'y sont jamais du texte affiché.
  'svg', 'path', 'g', 'defs', 'clipPath', 'rect', 'circle', 'line', 'polygon', 'polyline', 'ellipse', 'linearGradient', 'radialGradient', 'stop', 'mask', 'use', 'filter',
]);

function tagName(node) {
  const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  return opening ? opening.tagName.getText() : null;
}

/** Le nœud sépare-t-il en bloc (le blanc à côté de lui est alors invisible) ? */
function isBlock(node) {
  if (!node) return true;
  if (ts.isJsxFragment(node)) return true;
  const name = tagName(node);
  // Expression {…} ou composant : traité comme en ligne (le blanc est conservé).
  return name !== null && BLOCK.has(name);
}

export function fixSource(text, fileName = 'x.tsx') {
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const visit = (node) => {
    if ((ts.isJsxElement(node) || ts.isJsxFragment(node)) && node.children.length > 0) {
      const children = [...node.children];
      children.forEach((child, i) => {
        if (!ts.isJsxText(child)) return;
        const raw = child.getFullText(sf);
        if (!raw.includes('\n')) return;
        const prev = i > 0 ? children[i - 1] : null;
        const next = i < children.length - 1 ? children[i + 1] : null;
        // Au bord du parent, c'est le parent qui décide (bloc : blanc invisible).
        const before = prev ?? (isBlock(node) ? null : node);
        const after = next ?? (isBlock(node) ? null : node);
        const leading = /^\s*/.exec(raw)[0];
        const trailing = /\s*$/.exec(raw)[0];
        if (raw.trim() === '') {
          // Entre deux voisins en ligne, ou au bord d'un parent en ligne à côté d'un voisin en ligne.
          const between = prev && next && !isBlock(prev) && !isBlock(next);
          const edge = (!prev || !next) && (prev || next) && !isBlock(node) && !isBlock(prev ?? next);
          if (between || edge) edits.push([child.getFullStart(), child.getEnd(), `{' '}`]);
          return;
        }
        const start = child.getFullStart();
        if (leading.includes('\n') && before && !isBlock(before)) edits.push([start, start + leading.length, `{' '}`]);
        if (trailing.includes('\n') && after && !isBlock(after)) edits.push([child.getEnd() - trailing.length, child.getEnd(), `{' '}`]);
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  edits.sort((a, b) => b[0] - a[0]);
  let out = text;
  for (const [start, end, value] of edits) out = out.slice(0, start) + value + out.slice(end);
  return { out, count: edits.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const file of process.argv.slice(2)) {
    const { out, count } = fixSource(readFileSync(file, 'utf8'), file);
    if (count > 0) writeFileSync(file, out);
    console.log(`${file} : ${count} blanc(s) rendu(s) explicite(s)`);
  }
}
