import { createHash } from 'node:crypto';

/** Espaces insécables et blancs multiples ramenés à une espace simple. */
export function normText(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Résout un href relatif en URL absolue, fragment retiré.
 * Les schémas non HTTP (mailto:, tel:) sont conservés tels quels : ce sont des liens réels.
 * Retourne null pour ce qui n'est pas un lien (javascript:, "#", vide).
 */
export function absUrl(href: string | null | undefined, base: string): string | null {
  if (href == null) return null;
  const raw = href.trim();
  if (raw === '' || raw.startsWith('#') || /^javascript:/i.test(raw)) return null;
  if (/^(mailto|tel|sms|whatsapp):/i.test(raw)) return raw;
  try {
    const url = new URL(raw, base);
    url.hash = '';
    return decodeNextImage(url.toString());
  } catch {
    return raw;
  }
}

/**
 * next/image sert les images via /_next/image?url=<src>&w=…&q=… : on compare la
 * source réelle, pas l'URL d'optimisation, pour que la parité reste vérifiable
 * après la migration.
 */
export function decodeNextImage(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname !== '/_next/image') return url;
    const inner = parsed.searchParams.get('url');
    if (!inner) return url;
    return new URL(inner, parsed.origin).toString();
  } catch {
    return url;
  }
}

export function sameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/** Tri récursif des clés : deux JSON-LD équivalents produisent la même sérialisation. */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      out[key] = typeof v === 'string' ? normText(v) : sortKeysDeep(v);
    }
    return out;
  }
  return typeof value === 'string' ? normText(value) : value;
}

export function sha256(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Nom de fichier lisible et stable pour une URL. Le suffixe de hash évite les
 * collisions (systèmes de fichiers insensibles à la casse, query strings).
 */
export function fileNameForUrl(url: string): string {
  const parsed = new URL(url);
  let slug = parsed.pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '__') || '_root';
  if (parsed.search) slug += '~' + parsed.search.slice(1);
  slug = slug.replace(/[^a-zA-Z0-9._~=-]+/g, '-').slice(0, 120);
  return `${slug}--${sha256(url).slice(0, 8)}.json`;
}

/** Remplace une origine par une autre dans toutes les chaînes d'un objet sérialisé. */
export function rewriteOrigins(json: string, from: string | null, to: string | null): string {
  if (!from || !to || from === to) return json;
  const fromHost = new URL(from).host;
  const toHost = new URL(to).host;
  // Couvre https://host, http://host et //host (URLs protocol-relative), puis
  // le domaine nu (sondes de redirection apex → www).
  let out = json.split(`//${fromHost}`).join(`//${toHost}`);
  const fromApex = fromHost.replace(/^www\./, '');
  const toApex = toHost.replace(/^www\./, '');
  if (fromApex !== fromHost && toApex !== toHost) {
    out = out.split(`//${fromApex}`).join(`//${toApex}`);
  }
  return out;
}
