import type { SearchParams } from '@/lib/pages';
import type { Locale } from '@/i18n/translator';

const LABELS: Record<Locale, { previous: string; next: string }> = {
  fr: { previous: 'Précédent', next: 'Suivant' },
  en: { previous: 'Previous', next: 'Next' },
};

/** http_build_query de PHP (RFC 1738 : espace → « + »). */
function buildQuery(params: [string, string][]): string {
  const enc = (v: string) => encodeURIComponent(v).replace(/%20/g, '+').replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return params.map(([k, v]) => `${enc(k)}=${enc(v)}`).join('&');
}

/** Pages affichées (SlidingPagination::getPaginationData, page_range 5). */
export function slidingPages(current: number, pageCount: number, range = 5): number[] {
  const r = Math.min(range, pageCount);
  let delta = Math.ceil(r / 2);
  if (current - delta > pageCount - r) {
    return Array.from({ length: r }, (_, i) => pageCount - r + 1 + i);
  }
  if (current - delta < 0) delta = current;
  const offset = current - delta;
  return Array.from({ length: r }, (_, i) => offset + 1 + i);
}

/**
 * {{ knp_pagination_render(pagination) }} — gabarit bootstrap_v5 (= v4) de
 * KnpPaginatorBundle : même balisage, mêmes libellés, liens qui conservent
 * les autres paramètres de la requête (knp_pagination_query).
 */
export function Pagination({ locale, basePath, searchParams, current, totalItems, perPage }: { locale: Locale; basePath: string; searchParams: SearchParams; current: number; totalItems: number; perPage: number }) {
  const pageCount = Math.ceil(totalItems / perPage);
  if (pageCount <= 1) return null;
  const pages = slidingPages(current, pageCount);
  const startPage = Math.min(...pages);
  const endPage = Math.max(...pages);
  const others = Object.entries(searchParams).flatMap(([k, v]) => (k === 'page' || v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((x) => [k, x] as [string, string])));
  const href = (page: number) => `${basePath}?${buildQuery([...others, ['page', String(page)]])}`;
  const { previous, next } = LABELS[locale];
  const link = (page: number) => (
    <li key={`p${page}`} className="page-item">
      <a className="page-link" href={href(page)}>{' '}{page}{' '}</a>
    </li>
  );

  return (
    <nav>
      <ul className="pagination">
        {current - 1 > 0 ? (
          <li className="page-item">
            <a className="page-link" rel="prev" href={href(current - 1)}>{' '}&laquo;&nbsp;{previous}{' '}</a>
          </li>
        ) : (
          <li className="page-item disabled">
            <span className="page-link">&laquo;&nbsp;{previous}</span>
          </li>
        )}{' '}{startPage > 1 && link(1)}{' '}{startPage > 1 && startPage === 3 && link(2)}{' '}{startPage > 1 && startPage !== 3 && startPage !== 2 && (
          <li className="page-item disabled">
            <span className="page-link">&hellip;</span>
          </li>
        )}{' '}{pages.map((page) =>
          page !== current ? (
            link(page)
          ) : (
            <li key={`p${page}`} className="page-item active">
              <span className="page-link">{page}</span>
            </li>
          ),
        )}{' '}{pageCount > endPage && pageCount > endPage + 1 && pageCount > endPage + 2 && (
          <li className="page-item disabled">
            <span className="page-link">&hellip;</span>
          </li>
        )}{' '}{pageCount > endPage && pageCount > endPage + 1 && pageCount <= endPage + 2 && link(pageCount - 1)}{' '}{pageCount > endPage && link(pageCount)}{' '}{current + 1 <= pageCount ? (
          <li className="page-item">
            <a className="page-link" rel="next" href={href(current + 1)}>{' '}{next}&nbsp;&raquo;{' '}</a>
          </li>
        ) : (
          <li className="page-item disabled">
            <span className="page-link">{next}&nbsp;&raquo;</span>
          </li>
        )}
      </ul>
    </nav>
  );
}
