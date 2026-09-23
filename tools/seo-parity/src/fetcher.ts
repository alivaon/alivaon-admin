import { sha256 } from './normalize.ts';
import type { FetchResult, RedirectHop } from './types.ts';

export interface FetcherOptions {
  userAgent: string;
  /** "user:password" — envoyé uniquement aux hôtes de `authHosts` (jamais à un tiers). */
  basicAuth?: string;
  authHosts?: string[];
  concurrency: number;
  /** Pause après chaque requête, par worker : on reste poli avec la production. */
  delayMs: number;
  timeoutMs: number;
  maxRedirects: number;
}

const TEXT_TYPES = /^(text\/|application\/(xml|xhtml\+xml|json|ld\+json|rss\+xml|atom\+xml))/i;

/**
 * En-têtes non déterministes : ils changent à chaque requête et n'ont aucune
 * portée SEO. Tous les autres sont conservés.
 */
const VOLATILE_HEADERS = new Set(['date', 'age', 'expires', 'x-request-id', 'x-debug-token', 'x-debug-token-link', 'cf-ray', 'report-to', 'nel']);

export class Fetcher {
  private active = 0;
  private readonly waiting: (() => void)[] = [];
  requestCount = 0;

  private readonly options: FetcherOptions;

  constructor(options: FetcherOptions) {
    this.options = options;
  }

  async fetch(url: string, opts: { readBody?: boolean; followRedirects?: boolean } = {}): Promise<FetchResult> {
    const readBody = opts.readBody ?? true;
    const follow = opts.followRedirects ?? true;
    const chain: RedirectHop[] = [];
    let current = url;

    for (let hop = 0; hop <= this.options.maxRedirects; hop++) {
      let res: Response;
      try {
        res = await this.throttled(() => this.request(current));
      } catch (err) {
        return { requestedUrl: url, chain, finalUrl: current, status: 0, headers: {}, body: null, bodySha256: null, error: String(err) };
      }

      const location = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && location) {
        await res.body?.cancel();
        const next = new URL(location, current).toString();
        chain.push({ url: current, status: res.status, location: next });
        if (!follow) {
          return { requestedUrl: url, chain, finalUrl: current, status: res.status, headers: collectHeaders(res), body: null, bodySha256: null };
        }
        current = next;
        continue;
      }

      const headers = collectHeaders(res);
      const contentType = res.headers.get('content-type') ?? '';
      let body: string | null = null;
      let bodySha256: string | null = null;
      if (readBody && TEXT_TYPES.test(contentType)) {
        body = await res.text();
        bodySha256 = sha256(body);
      } else if (readBody) {
        bodySha256 = sha256(new Uint8Array(await res.arrayBuffer()));
      } else {
        await res.body?.cancel();
      }
      return { requestedUrl: url, chain, finalUrl: current, status: res.status, headers, body, bodySha256 };
    }

    return { requestedUrl: url, chain, finalUrl: current, status: 0, headers: {}, body: null, bodySha256: null, error: `Plus de ${this.options.maxRedirects} redirections` };
  }

  private async request(url: string): Promise<Response> {
    const headers: Record<string, string> = {
      'user-agent': this.options.userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8',
    };
    if (this.options.basicAuth && this.options.authHosts?.includes(new URL(url).hostname)) {
      headers.authorization = 'Basic ' + Buffer.from(this.options.basicAuth).toString('base64');
    }
    this.requestCount++;
    return fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(this.options.timeoutMs) });
  }

  private async throttled<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.options.concurrency) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active++;
    try {
      return await task();
    } finally {
      await new Promise((resolve) => setTimeout(resolve, this.options.delayMs));
      this.active--;
      this.waiting.shift()?.();
    }
  }
}

function collectHeaders(res: Response): Record<string, string> {
  const out: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    if (VOLATILE_HEADERS.has(key) || key === 'set-cookie') return;
    out[key] = value;
  });
  // Seuls les NOMS des cookies comptent (présence d'une session sur une page publique).
  const cookies = res.headers.getSetCookie().map((c) => c.split('=')[0]?.trim() ?? '').filter(Boolean);
  if (cookies.length) out['set-cookie'] = [...new Set(cookies)].sort().join(', ');
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
