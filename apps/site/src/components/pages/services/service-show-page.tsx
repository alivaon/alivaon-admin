import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { pillarDef } from './service-common';

/** Feuille de style des cartes « services liés » (dans le gabarit Twig). */
const RELATED_CSS = `
      .related-service{
        background:#fff;
        border:1px solid rgba(16,16,16,.08);
        border-radius:16px;
        overflow:hidden;
        color:inherit;
        transition:transform .35s ease, box-shadow .35s ease, border-color .35s ease;
      }
      .related-service:hover{
        transform:translateY(-8px);
        box-shadow:0 22px 45px rgba(16,16,16,.12);
        border-color:rgba(54,169,225,.4);
      }
      .related-service__thumb{
        position:relative;
        height:170px;
        background-size:cover;
        background-position:center;
      }
      .related-service__thumb::after{
        content:"";
        position:absolute; inset:0;
        background:linear-gradient(180deg, rgba(16,16,16,0) 40%, rgba(16,16,16,.45) 100%);
      }
      .related-service__icon{
        position:absolute; left:14px; bottom:-22px; z-index:2;
        width:48px; height:48px;
        display:flex; align-items:center; justify-content:center;
        background:#36A9E1; color:#fff;
        border-radius:12px; font-size:1.1rem;
        box-shadow:0 8px 20px rgba(54,169,225,.4);
        transition:transform .35s ease;
      }
      .related-service:hover .related-service__icon{ transform:rotate(-8deg) scale(1.05); }
      .related-service__badge{
        position:absolute; top:12px; right:12px; z-index:2;
        background:#36A9E1; color:#fff;
        font-size:.65rem; font-weight:600;
        padding:.25rem .6rem; border-radius:999px;
        text-transform:uppercase; letter-spacing:.04em;
      }
      .related-service__body{ padding:34px 22px 24px; }
      .related-service__pillar{
        font-size:.72rem; opacity:.55; margin-bottom:.5rem;
        text-transform:uppercase; letter-spacing:.05em;
      }
      .related-service__title{
        font-size:1.15rem; line-height:1.35; margin:0 0 .6rem;
        transition:color .25s ease;
      }
      .related-service:hover .related-service__title{ color:#36A9E1; }
      .related-service__desc{
        font-size:.92rem; opacity:.75; margin:0 0 1rem;
        display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
      }
      .related-service__link{
        display:inline-flex; align-items:center; gap:.4rem;
        font-weight:600; font-size:.9rem; color:#36A9E1;
      }
      .related-service__link svg{ transition:transform .3s ease; }
      .related-service:hover .related-service__link svg{ transform:translateX(5px); }
`;

/** service/show.html.twig */
export async function ServiceShowPage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = translator(locale);
  // Traduction absente ou non publiée : 404 de l'API → page 404, jamais de repli.
  const service = await load(api.GET('/api/public/{locale}/services/{slug}', { params: { path: { locale, slug } }, fetch: cached('services') }));
  const pillar = service.pillar ? pillarDef(locale, service.pillar) : null;
  const shortDescription = service.shortDescription ?? `${service.title} - ${t('service.show.meta_suffix')}`;
  const imageName = service.featuredImage ?? 'x.jpg';

  return (
    <PageShell
      page={{ locale, route: 'app_service_show', alternates: service.alternates }}
      seo={{
        pathname: path(locale, 'app_service_show', { slug }),
        title: `${service.title} - ${t('service.show.title_suffix')}`,
        description: shortDescription,
        ogTitle: `${service.title} - ${t('service.show.og_title_suffix')}`,
        ogDescription: `${service.title} : ${t('service.show.og_desc_suffix')}`,
        ogImage: absoluteUrl(service.featuredImage ?? asset('build/images/inner/service-details/service-details-thumb1_1.jpg')),
        ogImageType: imageName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        ogImageAlt: `${service.title} - ${t('service.show.og_image_alt')}`,
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: service.title,
              description: service.shortDescription ?? `${service.title} - ${t('service.show.jsonld_desc_suffix')}`,
              provider: {
                '@type': 'LocalBusiness',
                name: 'Alivaon',
                telephone: '+237691962158',
                email: 'contact@alivaon.com',
                address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
              },
              areaServed: ['Douala', 'Yaoundé', 'Cameroun'],
              offers: { '@type': 'Offer', priceCurrency: 'XAF', availability: 'https://schema.org/InStock', description: t('service.show.jsonld_offer') },
            }}
          />
        ),
      }}
    >
      <section className="service-details section-bg overflow-hidden pb-0">
    <div className="container rr-container-1600">
      {pillar && (
        <p style={{ fontSize: '.85rem', opacity: '.6', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {pillar.title}
        </p>
      )}
      <h1 className="service-details__title">
        {service.title}{' '}{service.badge && (
          <span className="badge ms-2 rounded-pill align-middle" style={{ background: '#36A9E1', fontSize: '.75rem' }}>{service.badge}</span>
        )}
      </h1>
      <div className="service-details__items">
        <ul className="service-details__items-list">
          {service.features && service.features.length > 0 ? (
            service.features.map((feature, index) => (
              <li key={index} className={`service-details__items-list-bt${index % 2 === 0 ? '' : '2'}`}>{feature}</li>
            ))
          ) : (
            <>
              <li className="service-details__items-list-bt">{t('service.show.feature1')}</li>
            <li className="service-details__items-list-bt2">{t('service.show.feature2')}</li>
            <li className="service-details__items-list-bt">{t('service.show.feature3')}</li>
            <li className="service-details__items-list-bt2">{t('service.show.feature4')}</li>
            <li className="service-details__items-list-bt">{t('service.show.feature5')}</li>
            <li className="service-details__items-list-bt2">{t('service.show.feature6')}</li>
            </>
          )}
        </ul>
      </div>
    </div>
    <div className="service-details__thumb" data-bg-src={service.featuredImage ?? asset('build/images/inner/service-details/service-details-thumb1_1.jpg')}>
    </div>
    <div className="container rr-container-1350">
      {service.fullDescription ? (
        <>
          <div className="service-details__subtitle">{service.title}</div>
          <div className="service-details__text" dangerouslySetInnerHTML={{ __html: service.fullDescription }} />
        </>
      ) : (
        <>
          <div className="service-details__subtitle">{t('service.show.desc_fallback_title')}</div>
        <p className="service-details__text">{t('service.show.desc_fallback_text')}</p>
        </>
      )}

      <div className="row g-4 justify-content-between">
        <div className="col-xl-3 col-lg-4 col-md-6">
          <div className="service-details__card">
            <div className="service-details__card-number">01.</div>
            <h3 className="service-details__card-title">{service.steps[0]?.title || t('service.show.step1_title')}</h3>
            <p className="service-details__card-subtitle">{service.steps[0]?.content || t('service.show.step1_content')}</p>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6">
          <div className="service-details__card">
            <div className="service-details__card-number">02.</div>
            <h3 className="service-details__card-title">{service.steps[1]?.title || t('service.show.step2_title')}</h3>
            <p className="service-details__card-subtitle">{service.steps[1]?.content || t('service.show.step2_content')}</p>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6">
          <div className="service-details__card">
            <div className="service-details__card-number">03.</div>
            <h3 className="service-details__card-title">{service.steps[2]?.title || t('service.show.step3_title')}</h3>
            <p className="service-details__card-subtitle">{service.steps[2]?.content || t('service.show.step3_content')}</p>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6">
          <div className="service-details__card">
            <div className="service-details__card-number">04.</div>
            <h3 className="service-details__card-title">{service.steps[3]?.title || t('service.show.step4_title')}</h3>
            <p className="service-details__card-subtitle">{service.steps[3]?.content || t('service.show.step4_content')}</p>
          </div>
        </div>
      </div>

      <div className="service-details__content">
        <h2 className="service-details__content-title">{service.why[0]?.title || t('service.show.why_title1')}</h2>
        <p className="service-details__content-subtitle">{service.why[0]?.content || t('service.show.why_text1')}</p>
        <h2 className="service-details__content-title2">{service.why[1]?.title || t('service.show.why_title2')}</h2>
        <p className="service-details__content-subtitle2">{service.why[1]?.content || t('service.show.why_text2')}</p>
        <div className="service-details__content-items">
          <ul className="service-details__content-items-list">
            {service.whyPoints && service.whyPoints.length > 0 ? (
              service.whyPoints.map((point, index) => (
                <li key={index}>
                  <div className="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                      <line x1="9.5" x2="9.5" y2="7" stroke="#101010" /><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010" />
                      <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010" /><line y1="9.5" x2="7" y2="9.5" stroke="#101010" />
                    </svg>
                  </div>
                  {point}
                </li>
              ))
            ) : (
              <>
                <li>
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                    <line x1="9.5" x2="9.5" y2="7" stroke="#101010" /><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010" />
                    <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010" /><line y1="9.5" x2="7" y2="9.5" stroke="#101010" />
                  </svg>
                </div>
                {t('service.show.point1')}
              </li>
              <li>
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                    <line x1="9.5" x2="9.5" y2="7" stroke="#101010" /><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010" />
                    <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010" /><line y1="9.5" x2="7" y2="9.5" stroke="#101010" />
                  </svg>
                </div>
                {t('service.show.point2')}
              </li>
              <li>
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                    <line x1="9.5" x2="9.5" y2="7" stroke="#101010" /><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010" />
                    <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010" /><line y1="9.5" x2="7" y2="9.5" stroke="#101010" />
                  </svg>
                </div>
                {t('service.show.point3')}
              </li>
              <li>
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                    <line x1="9.5" x2="9.5" y2="7" stroke="#101010" /><line x1="9.5" y1="12" x2="9.5" y2="19" stroke="#101010" />
                    <line x1="12" y1="9.5" x2="19" y2="9.5" stroke="#101010" /><line y1="9.5" x2="7" y2="9.5" stroke="#101010" />
                  </svg>
                </div>
                {t('service.show.point4')}
              </li>
              </>
            )}
          </ul>
        </div>

        
        <div className="service-details__cta" style={{ marginTop: '2.5rem', marginBottom: '4rem' }}>
          <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('service.show.cta_aria', { '%title%': service.title })}>{' '}{t('service.show.cta_button')}{' '}</a>
        </div>
      </div>
    </div>
    <div className="service-details__thumb2" data-bg-src={service.image2 ?? asset('build/images/inner/service-details/service-details-thumb1_2.jpg')}>
    </div>
  </section>

  

  
  {service.related.length > 0 && (
    <>
      <section className="section-spacing section-bg overflow-hidden" aria-label={t('service.show.others_aria')}>
        <div className="container rr-container-1600">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-5">
            <div>
              <p className="wow fadeInUp" data-wow-delay=".1s" style={{ fontSize: '.85rem', opacity: '.6', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {pillar ? (
                  <>
                    {t('service.show.recommended_in')} {pillar.title}
                  </>
                ) : (
                  t('service.show.keep_exploring')
                )}
              </p>
              <h2 className="wow fadeInUp m-0" data-wow-delay=".2s">{t('service.show.other_services')}</h2>
            </div>
            <a href={path(locale, 'app_service_index')} className="btn btn-info wow fadeInUp" data-wow-delay=".3s" aria-label={t('service.show.see_all_aria')}>{' '}{t('service.show.see_all')}{' '}</a>
          </div>

          <div className="row g-4">
            {service.related.map((related, index) => {
              const relatedPillar = related.pillar ? pillarDef(locale, related.pillar) : null;
              return (
                <div key={related.slug} className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${(0.15 + index * 0.12).toFixed(2)}s`}>
                  <a href={path(locale, 'app_service_show', { slug: related.slug })} className="related-service d-flex flex-column h-100 text-decoration-none" aria-label={t('service.show.discover_aria', { '%title%': related.title })}>

                    <div className="related-service__thumb" style={{ backgroundImage: `url('${related.featuredImage ?? asset('build/images/inner/service-details/service-details-thumb1_1.jpg')}')` }}>
                      {relatedPillar && (
                        <span className="related-service__icon"><i className={relatedPillar.icon} aria-hidden="true"></i></span>
                      )}{' '}{related.badge && (
                        <span className="related-service__badge">{related.badge}</span>
                      )}
                    </div>

                    <div className="related-service__body d-flex flex-column flex-grow-1">
                      {relatedPillar && (
                        <div className="related-service__pillar">{relatedPillar.title}</div>
                      )}
                      <h3 className="related-service__title">{related.title}</h3>
                      {related.shortDescription && (
                        <p className="related-service__desc">{related.shortDescription}</p>
                      )}{' '}<span className="related-service__link mt-auto">{' '}{t('service.show.discover')}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: RELATED_CSS }} />
    </>
  )}{' '}</PageShell>
  );
}
