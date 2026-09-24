import en from '@/generated/messages.en.json';
import fr from '@/generated/messages.fr.json';

export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const CATALOGS: Record<Locale, Record<string, string>> = { fr, en };

export type TransParams = Record<string, string | number>;

/**
 * Traduction avec la sémantique du Translator Symfony (catalogues XLIFF non
 * ICU) : clé absente → la clé elle-même ; paramètres remplacés tels quels
 * (« %name% ») ; pluriel seulement si %count% est fourni.
 */
export function trans(locale: Locale, id: string, params: TransParams = {}): string {
  const message = CATALOGS[locale][id] ?? id;
  const count = params['%count%'];
  const chosen = typeof count === 'number' || (typeof count === 'string' && count !== '' && !Number.isNaN(Number(count))) ? choose(message, Number(count), locale) : message;

  return replaceParams(chosen, params);
}

function replaceParams(message: string, params: TransParams): string {
  const keys = Object.keys(params).sort((a, b) => b.length - a.length);
  if (keys.length === 0) {
    return message;
  }
  // strtr : remplacement en une passe, clés les plus longues d'abord.
  const pattern = new RegExp(keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return message.replace(pattern, (key) => String(params[key]));
}

const INTERVAL = /^\s*(?:(\{\s*-?\d+(?:\.\d+)?(?:\s*,\s*-?\d+(?:\.\d+)?)*\s*\})|([[\]])\s*(-Inf|\*|-?\d+(?:\.\d+)?)\s*,\s*(\+?Inf|\*|-?\d+(?:\.\d+)?)\s*([[\]]))\s*([\s\S]*)$/;

/** Choix d'une forme plurielle (TranslatorTrait::trans de Symfony). */
function choose(message: string, count: number, locale: Locale): string {
  // Parties séparées par « | » (« || » = barre littérale).
  const parts = message.split(/(?<!\|)\|(?!\|)/).map((p) => p.replace(/\|\|/g, '|'));
  const standard: string[] = [];

  for (const part of parts) {
    const m = INTERVAL.exec(part);
    if (!m) {
      standard.push(part.replace(/^[\w-]+:\s*/, ''));
      continue;
    }
    const [, set, left, from, to, right, text] = m;
    if (set) {
      const values = set.slice(1, -1).split(',').map((v) => Number(v.trim()));
      if (values.includes(count)) {
        return text;
      }
      continue;
    }
    const lo = from === '-Inf' || from === '*' ? -Infinity : Number(from);
    const hi = to === 'Inf' || to === '+Inf' || to === '*' ? Infinity : Number(to);
    const afterLow = left === '[' ? count >= lo : count > lo;
    const beforeHigh = right === ']' ? count <= hi : count < hi;
    if (afterLow && beforeHigh) {
      return text;
    }
  }

  if (standard.length === 0) {
    return message;
  }
  // Règles plurielles standard (fr : 0 et 1 au singulier ; en : 1 seul).
  const index = locale === 'fr' ? (count > 1 ? 1 : 0) : count === 1 ? 0 : 1;
  return standard[Math.min(index, standard.length - 1)] ?? message;
}

/** Traducteur lié à une locale (équivalent du filtre |trans du gabarit). */
export function translator(locale: Locale) {
  return (id: string, params?: TransParams) => trans(locale, id, params);
}
