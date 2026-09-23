/** Un saut de la chaîne de redirections, tel que servi (jamais suivi implicitement). */
export interface RedirectHop {
  url: string;
  status: number;
  location: string | null;
}

export interface FetchResult {
  requestedUrl: string;
  /** Tous les sauts 3xx rencontrés, dans l'ordre. Vide si la première réponse n'est pas une redirection. */
  chain: RedirectHop[];
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  /** Corps texte (HTML, XML, texte). Null pour les réponses binaires ou non lues. */
  body: string | null;
  bodySha256: string | null;
  error?: string;
}

export interface LinkRef {
  href: string;
  text: string;
  rel: string;
  count: number;
}

export interface ImageRef {
  src: string;
  /** null = attribut alt absent (différent d'un alt="" décoratif). */
  alt: string | null;
  count: number;
}

export interface HtmlSnapshot {
  lang: string | null;
  titles: string[];
  /** Clé "name:description", "property:og:title", "http-equiv:refresh"… → valeurs dans l'ordre du document. */
  metas: Record<string, string[]>;
  canonicals: string[];
  hreflang: { hreflang: string; href: string }[];
  /** Autres <link> signifiants (icon, prev, next, manifest…) ; feuilles de style et preloads exclus. */
  headLinks: { rel: string; href: string; type: string | null; sizes: string | null }[];
  jsonLd: unknown[];
  headings: { level: number; text: string }[];
  text: string;
  links: LinkRef[];
  images: ImageRef[];
  /** Images de fond déclarées via data-bg-src (thème actuel) — informatif. */
  bgImages: string[];
}

export type DiscoverySource = 'sitemap' | 'sitemap-alternate' | 'seed' | 'link' | 'redirect' | 'baseline';

export interface PageRecord {
  url: string;
  discoveredVia: DiscoverySource[];
  inlinks: number;
  status: number;
  chain: RedirectHop[];
  finalUrl: string;
  headers: Record<string, string>;
  html: HtmlSnapshot | null;
  error?: string;
}

export interface ProbeRecord {
  name: string;
  url: string;
  status: number;
  chain: RedirectHop[];
  finalUrl: string;
  headers: Record<string, string>;
  error?: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
  alternates: { hreflang: string; href: string }[];
}

export interface FileRecord {
  path: string;
  status: number;
  contentType: string | null;
  sha256: string | null;
  /** Contenu texte conservé pour robots.txt, llms.txt, sitemaps. */
  text: string | null;
}

export interface AssetRecord {
  url: string;
  status: number;
  contentType: string | null;
  finalUrl: string;
  referencedBy: number;
}

export interface Manifest {
  tool: string;
  toolVersion: string;
  createdAt: string;
  /** Origine réellement interrogée. */
  origin: string;
  /** Origine substituée à `origin` dans tous les fichiers écrits (comparaison staging ↔ prod). */
  rewrittenTo: string | null;
  counts: Record<string, number>;
  options: Record<string, unknown>;
}

export interface LighthouseSummary {
  template: string;
  url: string;
  runs: number;
  scores: Record<string, number | null>;
  /** Médiane par métrique sur les runs. */
  metrics: Record<string, number | null>;
  failedSeoAudits: string[];
}
