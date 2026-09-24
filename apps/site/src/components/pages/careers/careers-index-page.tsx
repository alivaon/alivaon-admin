import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members, totalItems } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { queryParam, sliceChars, staticAlternates, stripTags, type SearchParams } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

const PER_PAGE = 9;

/** onchange="this.form.submit()" des filtres (le gabarit l'écrit en attribut). */
const CAREERS_SCRIPT = `document.querySelectorAll('.carriere-filter__select').forEach(function (s) { s.addEventListener('change', function () { s.form.submit(); }); });`;

/** Paramètres de path() hors route : query string RFC 3986, valeurs vides comprises (UrlGenerator). */
function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** carriere/index.html.twig (?contrat, ?lieu, ?q, ?page ; 9 offres par page). */
export async function CareersIndexPage({ locale, searchParams }: { locale: Locale; searchParams: SearchParams }) {
  const t = translator(locale);
  const contract = queryParam(searchParams, 'contrat') ?? '';
  const location = queryParam(searchParams, 'lieu') ?? '';
  const search = queryParam(searchParams, 'q') ?? '';
  // max(1, getInt('page', 1)) : un entier ≤ 0 vaut 1 (le non-entier → 400 dans proxy.ts).
  const rawPage = Number(queryParam(searchParams, 'page') ?? '1');
  const requested = Number.isInteger(rawPage) ? Math.max(1, rawPage) : 1;
  const [data, filters] = await Promise.all([
    load(
      api.GET('/api/public/{locale}/job-offers', {
        params: { path: { locale }, query: { page: requested, ...(contract ? { contractType: contract } : {}), ...(location ? { location } : {}), ...(search ? { search } : {}) } },
        fetch: cached('job-offers'),
      }),
    ),
    load(api.GET('/api/public/{locale}/job-offer-filters', { params: { path: { locale } }, fetch: cached('job-offers') })),
  ]);
  const offers = members(data);
  const total = totalItems(data);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = requested;
  const contractTypes = filters.contractTypes as string[];
  const locations = filters.locations as string[];
  const pageUrl = (p: number) =>
    `${path(locale, 'app_carriere_index')}?page=${p}&contrat=${rfc3986(contract)}&lieu=${rfc3986(location)}&q=${rfc3986(search)}`;

  return (
    <PageShell
      page={{ locale, route: 'app_carriere_index', alternates: staticAlternates('app_carriere_index') }}
      pageScripts={[{ inline: CAREERS_SCRIPT }]}
      seo={{
        pathname: path(locale, 'app_carriere_index'),
        title: t('carriere.index.title'),
        description: t('carriere.index.meta_description'),
        ogTitle: t('carriere.index.og_title'),
        ogDescription: t('carriere.index.og_description'),
        extra:
          offers.length > 0 ? (
            <JsonLd
              data={{
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: t('carriere.index.jsonld_name'),
                itemListElement: offers.map((offer, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'JobPosting',
                    title: offer.title,
                    description: offer.shortDescription || stripTags(offer.description),
                    datePosted: twigDate(offer.publishedAt ?? offer.createdAt, 'Y-m-d'),
                    ...(offer.expiresAt ? { validThrough: twigDate(offer.expiresAt, 'Y-m-d') } : {}),
                    employmentType: offer.contractType.toUpperCase().replace(/ /g, '_').replace(/É/g, 'E').replace(/Ô/g, 'O'),
                    hiringOrganization: { '@type': 'Organization', name: 'Alivaon', sameAs: 'https://www.alivaon.com' },
                    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: offer.location || 'Douala', addressCountry: 'CM' } },
                    url: absoluteUrl(path(locale, 'app_carriere_show', { slug: offer.slug })),
                  },
                })),
              }}
            />
          ) : undefined,
      }}
    >
      <div className="breadcrumb1 section-bg overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb1__top">
        <div className="breadcrumb1__top-left">{t('carriere.index.join')}</div>
        <div className="breadcrumb1__top-right">
          <div className="breadcrumb1__top-right-img">
            <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt={t('carriere.index.img_alt1')} />
          </div>
          <div className="breadcrumb1__top-right-text">{t('carriere.index.tagline')}</div>
        </div>
      </div>
      <h1 className="breadcrumb1__title">{t('carriere.index.h1')}</h1>
    </div>
    <div className="breadcrumb1__thumb rr-ov-hidden wow fadeInUp" data-wow-delay="0.3s">
      <img data-speed="0.9" src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt={t('carriere.index.img_alt2')} />
    </div>
  </div>

  
  <div className="inner-page section-bg">
    <div className="container rr-container-1800">
      <div className="inner-page__title">{t('carriere.index.section')}</div>
      <div className="inner-page__description">
        {t('carriere.index.intro')}
      </div>
    </div>
  </div>

  
  <section className="rr-bg-primary section-spacing overflow-hidden" data-background={asset('build/images/service/service-3-bg.png')} aria-label={t('carriere.index.why_aria')}>
    <div className="container rr-container-1600">
      <div className="text-center mb-5">
        <h2 className="section__subtitle" style={{ color: '#fff' }}><span></span>{t('carriere.index.why_title')}</h2>
      </div>
      <div className="row g-4">

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon">
              <i className="fa-solid fa-rocket-launch"></i>
            </div>
            <h2 className="service-details__card-title">{t('carriere.index.perk1')}</h2>
            <p className="service-details__card-subtitle">{t('carriere.index.perk1_text')}</p>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h2 className="service-details__card-title">{t('carriere.index.perk2')}</h2>
            <p className="service-details__card-subtitle">{t('carriere.index.perk2_text')}</p>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon">
              <i className="fa-solid fa-earth-africa"></i>
            </div>
            <h2 className="service-details__card-title">{t('carriere.index.perk3')}</h2>
            <p className="service-details__card-subtitle">{t('carriere.index.perk3_text')}</p>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon">
              <i className="fa-solid fa-handshake-simple"></i>
            </div>
            <h2 className="service-details__card-title">{t('carriere.index.perk4')}</h2>
            <p className="service-details__card-subtitle">{t('carriere.index.perk4_text')}</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  
  <section className="section-bg section-spacing rr-ov-hidden" aria-label={t('carriere.index.filter_aria')}>
    <div className="container rr-container-1600">
      <div className="text-center mb-5">
        <h2 className="section__subtitle"><span></span>{t('carriere.index.offers_count', { '%count%': total })}</h2>
      </div>

      <form method="GET" action={path(locale, 'app_carriere_index')} className="row g-3 mb-5 wow fadeInUp" data-wow-delay=".3s" aria-label={t('carriere.index.filters_aria')}>
        <div className="col-md-4">
          <input type="text" name="q" defaultValue={search} className="carriere-filter__input" placeholder={t('carriere.index.search_placeholder')} aria-label={t('carriere.index.search_aria')} />
        </div>
        <div className="col-md-3">
          {/* onchange="this.form.submit()" du gabarit : CAREERS_SCRIPT (React n'accepte pas de gestionnaire en chaîne). */}{' '}<select name="contrat" className="carriere-filter__select" aria-label={t('carriere.contract_type')} defaultValue={contract}>{' '}<option value="">{t('carriere.index.all_contracts')}</option>{' '}{contractTypes.map((type) => (
              <option key={type} value={type}>{t(`contract.${type}`)}</option>
            ))}{' '}</select>
        </div>
        <div className="col-md-3">
          <select name="lieu" className="carriere-filter__select" aria-label={t('carriere.location')} defaultValue={location}>{' '}<option value="">{t('carriere.index.all_locations')}</option>{' '}{locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}{' '}</select>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-info w-100" style={{ height: '52px' }} aria-label={t('blog.sidebar.search')}>{' '}<i className="fa-solid fa-magnifying-glass me-1"></i> {t('blog.sidebar.search')}{' '}</button>
        </div>
        {(contract || location || search) && (
          <div className="col-12 text-center">
            <a href={path(locale, 'app_carriere_index')} className="btn btn-outline-secondary btn-sm">{' '}<i className="fa-solid fa-xmark me-1"></i> {t('carriere.index.clear_filters')}{' '}</a>
          </div>
        )}
      </form>

      {offers.length > 0 ? (
        <>
          <div className="row g-4">
            {offers.map((offer, index) => (
              <div key={offer.slug} className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay={`${((index % 3) * 0.2)}s`}>
                <article className="job-card" aria-label={offer.title}>
                  {offer.coverImage && (
                    <div className="job-card__thumb">
                      <img src={offer.coverImage} alt={offer.title} loading="lazy" decoding="async" />
                    </div>
                  )}
                  <div className="job-card__body">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge rounded-pill py-1 px-3" style={{ background: '#36A9E1', color: '#101010', fontSize: '.72rem', fontWeight: '600', letterSpacing: '.03em' }}>{' '}{t(`contract.${offer.contractType}`)}{' '}</span>{' '}{offer.location && (
                        <span className="badge rounded-pill py-1 px-3" style={{ background: 'rgba(16,16,16,.06)', color: '#101010', border: '1px solid rgba(16,16,16,.1)', fontSize: '.72rem' }}>{' '}<i className="fa-solid fa-location-dot me-1"></i>{offer.location}{' '}</span>
                      )}{' '}{offer.expiresAt && (
                        <span className="badge rounded-pill py-1 px-3" style={{ background: 'rgba(239,68,68,.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,.25)', fontSize: '.7rem' }}>{' '}<i className="fa-regular fa-clock me-1"></i>{t('carriere.expires_on', { '%date%': twigDate(offer.expiresAt, 'd/m/Y') })}{' '}</span>
                      )}
                    </div>
                    <h2 className="job-card__title">
                      <a href={path(locale, 'app_carriere_show', { slug: offer.slug })}>{offer.title}</a>
                    </h2>
                    {offer.shortDescription && (
                      <p className="job-card__excerpt">{`${sliceChars(offer.shortDescription, 0, 130)}${Array.from(offer.shortDescription).length > 130 ? '…' : ''}`}</p>
                    )}{' '}{offer.salary && (
                      <p className="job-card__salary">
                        <i className="fa-solid fa-wallet me-1"></i>{offer.salary}
                      </p>
                    )}{' '}{offer.skills && offer.skills.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {offer.skills.slice(0, 4).map((skill, i) => (
                          // Une pastille par ligne dans le gabarit : blanc entre chacune.
                          <Fragment key={i}>
                            <span className="skill-pill">{skill}</span>{' '}
                          </Fragment>
                        ))}
                        {offer.skills.length > 4 && <span className="skill-pill">{`+${offer.skills.length - 4}`}</span>}
                      </div>
                    )}
                    <div className="mt-auto">
                      <a href={path(locale, 'app_carriere_show', { slug: offer.slug })} className="rr-btn-2 btn-purple" aria-label={`Voir l'offre ${offer.title}`}>{' '}<span className="btn-wrap">{' '}<span className="text-one">{t('carriere.index.view_offer')}</span>{' '}<span className="text-two">{t('carriere.index.view_offer')}</span>{' '}</span>{' '}</a>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <nav className="d-flex justify-content-center mt-5" aria-label={t('carriere.index.pagination_aria')}>
              <ul className="pagination gap-2">
                {page > 1 && (
                  <li className="page-item">
                    <a className="page-link" href={pageUrl(page - 1)} aria-label={t('pagination.previous')}>{' '}<i className="fa-solid fa-chevron-left"></i>{' '}</a>
                  </li>
                )}{' '}{Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                    <a className="page-link" href={pageUrl(p)}>{p}</a>
                  </li>
                ))}{' '}{page < pages && (
                  <li className="page-item">
                    <a className="page-link" href={pageUrl(page + 1)} aria-label={t('pagination.next')}>{' '}<i className="fa-solid fa-chevron-right"></i>{' '}</a>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-5 wow fadeInUp" data-wow-delay=".3s">
          <div style={{ fontSize: '2.8rem', marginBottom: '1rem', color: 'rgba(16,16,16,.2)' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '.75rem' }}>{t('carriere.index.no_result')}</h2>
          <p style={{ opacity: '.6', marginBottom: '1.5rem' }}>{t('carriere.index.no_result_hint')}</p>
          <a href={path(locale, 'app_carriere_index')} className="btn btn-info">{t('carriere.index.view_all')}</a>
        </div>
      )}
    </div>
  </section>

  
  <section className="section-bg section-spacing overflow-hidden" aria-label={t('carriere.index.spontaneous')}>
    <div className="container rr-container-1200">
      <div className="row g-5 align-items-center">
        <div className="col-xl-7 col-lg-7 wow fadeInLeft" data-wow-delay=".3s">
          <div className="faq1__top-section-title">{t('carriere.index.spontaneous_title')}</div>
          <p style={{ marginTop: '1rem', fontSize: '1.05rem', opacity: '.8', maxWidth: '520px' }}>
            {t('carriere.index.spontaneous_text')}
          </p>
        </div>
        <div className="col-xl-5 col-lg-5 text-center text-lg-end wow fadeInRight" data-wow-delay=".5s">
          <a href={path(locale, 'app_contact')} className="rr-btn-2 btn-purple" aria-label={t('carriere.index.spontaneous_aria')}>{' '}<span className="btn-wrap">{' '}<span className="text-one">{t('carriere.index.spontaneous')}</span>{' '}<span className="text-two">{t('carriere.index.spontaneous')}</span>{' '}</span>{' '}</a>
        </div>
      </div>
    </div>
  </section>
    </PageShell>
  );
}
