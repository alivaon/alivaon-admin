// Normalise l'export OpenAPI de Symfony avant la génération des types.
//
// API Platform ne déclare pas `required` sur les propriétés des DTO : tous les
// champs seraient facultatifs côté TypeScript. Or l'API renvoie toujours
// chaque champ (null si vide, KeepNullValuesContextBuilder). On déclare donc
// obligatoires toutes les propriétés de chaque objet, y compris dans les
// compositions allOf du JSON-LD, que --properties-required-by-default
// d'openapi-typescript ne traite pas. Les champs nullables restent nullables.
//
//   node scripts/normalize-openapi.mjs openapi.json
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2] ?? 'openapi.json';
const spec = JSON.parse(readFileSync(file, 'utf8'));

function visit(node) {
  if (Array.isArray(node)) {
    node.forEach(visit);
    return;
  }
  if (node === null || typeof node !== 'object') {
    return;
  }
  if (node.properties && typeof node.properties === 'object' && !Array.isArray(node.properties)) {
    node.required = Object.keys(node.properties).sort();
  }
  Object.values(node).forEach(visit);
}

visit(spec.components?.schemas ?? {});

// Tri des clés : export stable, diffs lisibles.
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
}

writeFileSync(file, JSON.stringify(sortKeys(spec), null, 2) + '\n');
console.log(`${file} normalisé`);
