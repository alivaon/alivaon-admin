import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { staticAlternates, stripTags } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { pillarDef, QuoteIcon, SECTORS } from './service-common';

/** Témoignages écrits en dur dans le gabarit, si aucun témoignage en base. */
const FALLBACK_TESTIMONIALS = [
  {
    name: 'Jean-Paul Mbarga, DG-Commerce & Distribution, Douala',
    text: "Le logiciel de gestion développé par Alivaon a complètement transformé notre façon de travailler. Nos équipes l'utilisent au quotidien sur leurs téléphones, même sans connexion stable.",
  },
  {
    name: 'Arielle Nkomo, CEO-StartupCam, Yaoundé',
    text: "Notre application mobile Android a été livrée en 4 mois, dans les délais et le budget. Nos commerciaux terrain l'utilisent partout au Cameroun. Alivaon comprend vraiment nos besoins locaux.",
  },
  {
    name: 'Sylvain Tchokounte, Directeur-PME Industrielle, Douala',
    text: "Alivaon a digitalisé toute notre gestion commerciale. Plus d'erreurs de facturation, plus de temps perdu. Je recommande à toutes les entreprises qui veulent se moderniser au Cameroun.",
  },
];

/** service/index.html.twig */
export async function ServiceIndexPage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const [services, testimonials, faqs] = await Promise.all([
    load(api.GET('/api/public/{locale}/services', { params: { path: { locale } }, fetch: cached('services') })).then(members),
    load(api.GET('/api/public/{locale}/testimonials', { params: { path: { locale } }, fetch: cached('testimonials') })).then(members),
    load(api.GET('/api/public/{locale}/faqs', { params: { path: { locale }, query: { category: 'Service' } }, fetch: cached('faqs') })).then(members),
  ]);
  // Regroupement par pilier (0 : non classé), clés triées (ksort du contrôleur).
  const groups = new Map<number, typeof services>();
  for (const service of services) {
    const key = service.pillar ?? 0;
    groups.set(key, [...(groups.get(key) ?? []), service]);
  }
  const groupedServices = [...groups.entries()].sort(([a], [b]) => a - b);
  const allServices = groupedServices.flatMap(([, list]) => list);

  return (
    <PageShell
      page={{ locale, route: 'app_service_index', alternates: staticAlternates('app_service_index') }}
      seo={{
        pathname: path(locale, 'app_service_index'),
        title: t('service.index.title'),
        description: t('service.index.meta_description'),
        ogTitle: t('service.index.og_title'),
        ogDescription: t('service.index.og_description'),
        extra: (
          <>
            <JsonLd
              data={{
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: t('service.index.jsonld_name'),
                description: t('service.index.jsonld_description'),
                provider: {
                  '@type': 'LocalBusiness',
                  name: 'Alivaon',
                  address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressCountry: 'CM' },
                  telephone: '+237691962158',
                },
                itemListElement: allServices.map((service, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  name: service.title,
                  url: absoluteUrl(path(locale, 'app_service_show', { slug: service.slug })),
                })),
              }}
            />{' '}{faqs.length > 0 && (
              <JsonLd
                data={{
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: { '@type': 'Answer', text: stripTags(faq.answer) },
                  })),
                }}
              />
            )}
          </>
        ),
      }}
    >
      
<div className="breadcrumb1 section-bg overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb1__top">
        <div className="breadcrumb1__top-left">{t('nav.services')}</div>
        <div className="breadcrumb1__top-right">
          <div className="breadcrumb1__top-right-img">
            <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt="Alivaon services digitaux Douala Cameroun" />
          </div>
          <div className="breadcrumb1__top-right-text">{t('service.index.badge')}</div>
        </div>
      </div>
      <h1 className="breadcrumb1__title">{t('service.index.h1')}</h1>
    </div>
    <div className="breadcrumb1__thumb rr-ov-hidden">
      <img data-speed="0.9" src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt="Développement logiciel et application mobile sur mesure à Douala, Cameroun - Alivaon" />
    </div>
  </div>

  <div className="inner-page section-bg">
    <div className="container rr-container-1800">
      <div className="inner-page__title">{t('service.index.services_word')}</div>
      <div className="inner-page__description">{t('service.index.description')}</div>
    </div>
  </div>

  
  <div className="team-achievement section-bg section-spacing rr-ov-hidden pb-0 overflow-hidden">
    <div className="container rr-container-1800">
      <div className="row g-4 d-flex justify-content-center">
        <div className="col-xl-5 col-lg-5 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="30">30</span>+</div>
            <p className="team-achievement__card-text">{t('service.index.kpi1')}</p>
          </div>
        </div>
        <div className="col-xl-7 col-lg-7 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="50">50</span>+</div>
            <p className="team-achievement__card-text">{t('service.index.kpi2')}</p>
          </div>
        </div>
        <div className="col-xl-7 col-lg-7 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="10">10</span>+</div>
            <p className="team-achievement__card-text">{t('service.index.kpi3')}</p>
          </div>
        </div>
        <div className="col-xl-5 col-lg-5 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="98">98</span>%</div>
            <p className="team-achievement__card-text">{t('service.index.kpi4')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <section className="section-bg section-spacing overflow-hidden" aria-label={t('service.index.sectors_aria')}>
    <div className="container rr-container-1800">
      <div className="text-center mb-5">
        <h2 className="section__subtitle"><span></span>{t('service.index.sectors_title')}</h2>
        <p className="mt-3" style={{ fontSize: '1.05rem', maxWidth: '680px', margin: '1rem auto 0' }}>{t('service.index.sectors_text')}</p>
      </div>
      <div className="d-flex flex-wrap gap-3 justify-content-center">
        {SECTORS.map(([fa, label]) => (
          <span key={fa} className="badge rounded-pill py-2 px-4 fs-6 fw-normal" style={{ background: 'rgba(54,169,225,0.1)', color: '#101010', border: '1px solid rgba(54,169,225,0.3)' }}>{' '}<i className={`fa-solid ${fa} me-1`}></i> {t(label)}{' '}</span>
        ))}
      </div>
    </div>
  </section>

  
  <section className="service-section-3__area rr-bg-primary section-spacing" data-background={asset('build/images/service/service-3-bg.png')} aria-label={t('service.index.services_aria')}>
    <div className="container rr-container-1800">

      {groupedServices.length > 0 ? (
        groupedServices.map(([pillar, pillarServices], groupIndex) => {
          const def = pillar > 0 ? pillarDef(locale, pillar) : null;
          const topStyle = groupIndex > 0 ? { marginTop: '4rem' } : undefined;
          return (
            <Fragment key={pillar}>{' '}{def ? (
                <div className="service-section-3__top" style={topStyle}>
                  <div className="section-heading__wrap_3">
                    <h2 className="section__subtitle">
                      <span></span><i className={`${def.icon} me-2`}></i>{def.title}
                    </h2>
                    <p className="mt-2" style={{ opacity: '.75' }}>{def.subtitle}</p>
                  </div>
                </div>
              ) : (
                <div className="service-section-3__top" style={topStyle}>
                  <div className="section-heading__wrap_3">
                    <h2 className="section__subtitle"><span></span>{t('service.index.our_services')}</h2>
                  </div>
                </div>
              )}

              <div className="service-section-3__wrapper">
                {pillarServices.map((service, index) => (
                  <div key={service.slug} className="service-section-3__item">
                    <div className="service-section-3__number">
                      <span>{String(index + 1).padStart(2, '0')}.</span>
                    </div>
                    <div className="service-section-3__info">
                      <h3 className="service-section-3__title">
                        <a href={path(locale, 'app_service_show', { slug: service.slug })}>{' '}{service.title}{' '}{service.badge && (
                            <span className="badge ms-2 rounded-pill" style={{ background: '#36A9E1', fontSize: '.65rem', verticalAlign: 'middle' }}>{service.badge}</span>
                          )}{' '}</a>
                      </h3>
                      {service.shortDescription && (
                        <p style={{ fontSize: '.95rem', marginBottom: '.75rem', opacity: '.8' }}>{service.shortDescription}</p>
                      )}{' '}{service.features && service.features.length > 0 && (
                        <div className="service-section-3__list"><ul>
                          {service.features.map((feature, i) => (
                            <li key={i}><span></span>{feature}</li>
                          ))}
                        </ul></div>
                      )}
                    </div>
                    <div className="service-section-3__thumb">
                      <img src={service.featuredImage ?? asset('build/images/service/service-3_01.jpg')} alt={`${service.title} - Alivaon Douala Cameroun`} loading="lazy" decoding="async" />
                    </div>
                  </div>
                ))}
              </div>
            </Fragment>
          );
        })
      ) : (
        <>
          {/* Version statique si aucun service en base. */}
          <div className="service-section-3__top">
            <div className="section-heading__wrap_3">
              <h2 className="section__subtitle"><span></span>{t('service.index.our_services')}</h2>
            </div>
          </div>
          <div className="service-section-3__wrapper">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="service-section-3__item">
                <div className="service-section-3__number"><span>{`0${i}`}.</span></div>
                <div className="service-section-3__info">
                  <h3 className="service-section-3__title"><a href={path(locale, 'app_service_index')}>{t(`service.index.fallback.${i}.title`)}</a></h3>
                  <div className="service-section-3__list"><ul>
                    {t(`service.index.fallback.${i}.features`).split('|').map((f, j) => <li key={j}><span></span>{f}</li>)}
                  </ul></div>
                </div>
                <div className="service-section-3__thumb">
                  <img src={asset('build/images/service/service-3_01.jpg')} alt={`${t(`service.index.fallback.${i}.title`)} - Alivaon Douala Cameroun`} loading="lazy" decoding="async" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  </section>

  
  <section className="section-bg section-spacing overflow-hidden" aria-label={t('service.index.method_aria')}>
    <div className="container rr-container-1600">
      <div className="text-center mb-5">
        <h2 className="section__subtitle"><span></span>{t('service.index.method_title')}</h2>
        <p className="mt-3" style={{ fontSize: '1.05rem' }}>{t('service.index.method_text')}</p>
      </div>
      <div className="row g-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="col-xl-4 col-lg-4 col-md-6">
            <div className="service-details__card h-100">
              <div className="service-details__card-number">{`0${n}`}.</div>
              <h3 className="service-details__card-title">{t(`service.index.m${n}_title`)}</h3>
              <p className="service-details__card-subtitle">{t(`service.index.m${n}_text`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  
  <section className="rr-bg-primary section-spacing overflow-hidden" data-background={asset('build/images/service/service-3-bg.png')} aria-label={t('service.index.why_aria')}>
    <div className="container rr-container-1600">
      <div className="text-center mb-5">
        <h2 className="section__subtitle" style={{ color: '#fff' }}><span></span>{t('service.index.why_title')}</h2>
      </div>
      <div className="row g-4">

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-location-dot"></i></div>
            <h3 className="service-details__card-title">{t('service.index.r1_title')}</h3>
            <p className="service-details__card-subtitle">{t('service.index.r1_text')}</p>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-wifi"></i></div>
            <h3 className="service-details__card-title">{t('service.index.r2_title')}</h3>
            <p className="service-details__card-subtitle">{t('service.index.r2_text')}</p>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-mobile-screen-button"></i></div>
            <h3 className="service-details__card-title">{t('service.index.r3_title')}</h3>
            <p className="service-details__card-subtitle">{t('service.index.r3_text')}</p>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-file-invoice"></i></div>
            <h3 className="service-details__card-title">{t('service.index.r4_title')}</h3>
            <p className="service-details__card-subtitle">{t('service.index.r4_text')}</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  
  <section className="testimonial-5__area section-spacing pb-0 bg-white overflow-hidden" aria-label={t('service.index.testimonials_aria')}>
    <div className="container container-1800">
      <div className="testimonial-5__wrapper">
        <div className="swiper testimonial-5__active">
          <div className="swiper-wrapper">
            {testimonials.length > 0
              ? testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="swiper-slide">
                    <div className="testimonial-5__item">
                      <div className="testimonial-5__quote"><QuoteIcon /></div>
                      <p className="testimonial-5__desc">{testimonial.content}</p>
                      <div className="testimonial-5__author">
                        <div className="testimonial-5__thumb">
                          <img src={testimonial.avatar ?? asset('build/images/testimonial/author-5-01.png')} alt={`${testimonial.clientName} - client Alivaon Cameroun`} loading="lazy" decoding="async" />
                        </div>
                        <p className="testimonial-5__name">{`${testimonial.clientName}${testimonial.clientPosition ? `, ${testimonial.clientPosition}` : ''}`}</p>
                      </div>
                    </div>
                  </div>
                ))
              : FALLBACK_TESTIMONIALS.map((item) => (
                  <div key={item.name} className="swiper-slide">
                    <div className="testimonial-5__item">
                      <div className="testimonial-5__quote"><QuoteIcon /></div>
                      <p className="testimonial-5__desc">{item.text}</p>
                      <div className="testimonial-5__author">
                        <div className="testimonial-5__thumb">
                          <img src={asset('build/images/testimonial/author-5-01.png')} alt="Client Alivaon Cameroun" loading="lazy" decoding="async" />
                        </div>
                        <p className="testimonial-5__name">{item.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
          <div className="testimonial-5__arrow">
            <div className="testimonial-5__swiper-button-prev"></div>
            <div className="testimonial-5__swiper-button-next"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  {faqs.length > 0 && (
<div className="section-bg section-spacing rr-ov-hidden" aria-label={t('service.index.faq_aria')}>
    <div className="container rr-container-1600">
    <div className="text-center mb-5">
        <h2 className="section__subtitle"><span></span>{t('service.index.faq_title')}</h2>
      </div>
      <div className="row gx-60 d-flex justify-content-center">
        <div className="col-xl-12">
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">{t('service.index.faq_subtitle')}</div>
          </div>
          <div className="accordion" id="accordionFaqService">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="global-accordion-item wow fadeInUp" data-wow-delay={`${(index + 1) * 0.2}s`}>
                <div className="global-accordion-header">
                  <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target={`#faqService${faq.id}`} aria-expanded="false">
                    <div className="question">{`${index + 1}. ${faq.question}`}</div>
                  </div>
                </div>
                <div id={`faqService${faq.id}`} className="global-accordion-collapse collapse" data-bs-parent="#accordionFaqService">
                  <div className="global-accordion-body style"><p>{faq.answer}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  )}

  
  <section className="rr-bg-primary section-spacing overflow-hidden text-center" data-background={asset('build/images/service/service-3-bg.png')} aria-label={t('service.index.cta_aria')}>
    <div className="container rr-container-1200">
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#fff' }}>{t('service.index.cta_title')}</h2>
      <p style={{ fontSize: '1.05rem', opacity: '.85', marginBottom: '2.5rem' }}>{t('service.index.cta_text')}</p>
      <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center">
        <a href={path(locale, 'app_contact')} className="btn btn-info btn-lg px-5" aria-label={t('service.index.cta_aria')}>{' '}{t('blog.show.cta_button')}{' '}</a>{' '}<a href="https://wa.me/237691962158" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-lg px-5" aria-label={t('service.index.whatsapp_aria')}>{' '}{t('service.index.whatsapp')}{' '}</a>
      </div>
      <p style={{ marginTop: '2rem', opacity: '.7', fontSize: '.9rem' }}>
        <i className="fa-solid fa-location-dot me-1"></i> Logpom, Douala &nbsp;|&nbsp;{' '}<i className="fa-solid fa-envelope me-1"></i> contact@alivaon.com &nbsp;|&nbsp;{' '}<i className="fa-solid fa-phone me-1"></i> +237 6 91 96 21 58
      </p>
    </div>
  </section>

  
  <div className="brand-slide-5__area section-spacing bg-white overflow-hidden" aria-label={t('service.index.clients_aria')}>
    <div className="container container-1800">
      <div dir="rtl" className="brand-section-5__slide">
        <div className="swiper brand-section-5__active">
          <div className="swiper-wrapper">
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_01.png')} alt="Client Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_02.png')} alt="Client Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_03.png')} alt="Client Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_04.png')} alt="Client Alivaon Douala" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_05.png')} alt="Client Alivaon Douala" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_06.png')} alt="Client Alivaon Douala" loading="lazy" decoding="async" /></div></div>
          </div>
        </div>
      </div>
      <div dir="ltr" className="brand-section-5__slide">
        <div className="swiper brand-section-5__active">
          <div className="swiper-wrapper">
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_07.png')} alt="Partenaire Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_08.png')} alt="Partenaire Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_09.png')} alt="Partenaire Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_10.png')} alt="Partenaire Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_11.png')} alt="Partenaire Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
            <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_12.png')} alt="Partenaire Alivaon Cameroun" loading="lazy" decoding="async" /></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>

    </PageShell>
  );
}
