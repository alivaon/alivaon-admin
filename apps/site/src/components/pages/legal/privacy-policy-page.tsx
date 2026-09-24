import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { absoluteUrl, asset, SITE_ORIGIN } from '@/lib/config';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { staticAlternates, today } from '@/lib/pages';

/** legal/politique_confidentialite.html.twig */
export function PrivacyPolicyPage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const pathname = path(locale, 'app_politique_confidentialite');

  return (
    <PageShell
      page={{ locale, route: 'app_politique_confidentialite', alternates: staticAlternates('app_politique_confidentialite') }}
      seo={{
        pathname,
        title: t('legal.privacy.title'),
        description: t('legal.privacy.meta_description'),
        robots: 'index, follow',
        ogTitle: t('legal.privacy.og_title'),
        ogDescription: t('legal.privacy.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: t('legal.privacy.og_title'),
              description: t('legal.privacy.jsonld_description'),
              url: absoluteUrl(pathname),
              inLanguage: locale,
              publisher: {
                '@type': 'Organization',
                name: 'Alivaon',
                url: SITE_ORIGIN,
                logo: absoluteUrl(asset('build/images/logo/logo.png')),
                address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
                telephone: '+237691962158',
                email: 'contact@alivaon.com',
              },
            }}
          />
        ),
      }}
    >
      <div className="breadcrumb1 section-bg overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb1__top">
        <div className="breadcrumb1__top-left">{t('legal.privacy.breadcrumb')}</div>
        <div className="breadcrumb1__top-right">
          <div className="breadcrumb1__top-right-img">
            <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt={t('legal.img_alt_generic')} />
          </div>
          <div className="breadcrumb1__top-right-text">{t('legal.privacy.badge')}</div>
        </div>
      </div>
      <h1 className="breadcrumb1__title">{t('legal.privacy.h1')}</h1>
    </div>
    <div className="breadcrumb1__thumb rr-ov-hidden wow fadeInUp" data-wow-delay="0.3s">
      <img data-speed="0.9" src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt={t('legal.privacy.img_alt')} />
    </div>
  </div>

  
  <div className="inner-page section-bg">
    <div className="container rr-container-1800">
      <div className="inner-page__title">{t('legal.privacy.section_word')}</div>
      <div className="inner-page__description">
        {t('legal.privacy.intro')}
      </div>
    </div>
  </div>

  
  <section className="rr-bg-primary section-spacing overflow-hidden" data-background={asset('build/images/service/service-3-bg.png')} aria-label={t('legal.privacy.commitments_aria')}>
    <div className="container rr-container-1600">
      <div className="text-center mb-5">
        <h2 className="section__subtitle" style={{ color: '#fff' }}><span></span>{t('legal.privacy.tagline')}</h2>
      </div>
      <div className="row g-4">

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-lock"></i></div>
            <h2 className="service-details__card-title">{t('legal.privacy.c1.title')}</h2>
            <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs1') }} />
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-ban"></i></div>
            <h2 className="service-details__card-title">{t('legal.privacy.c2.title')}</h2>
            <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs2') }} />
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-circle-check"></i></div>
            <h2 className="service-details__card-title">{t('legal.privacy.c3.title')}</h2>
            <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs3') }} />
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="service-details__card text-center h-100">
            <div className="reason-icon"><i className="fa-solid fa-earth-europe"></i></div>
            <h2 className="service-details__card-title">{t('legal.privacy.c4.title')}</h2>
            <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs4') }} />
          </div>
        </div>

      </div>
    </div>
  </section>

  
  <section className="faq1 section-spacing rr-ov-hidden" aria-label={t('legal.privacy.aria')}>
    <div className="container rr-container-1600">
      <div className="row gx-60 d-flex justify-content-center">
        <div className="col-xl-12">

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s1.title')}
            </div>
          </div>

          <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">
            <div className="col-xl-12">
              <div className="service-details__card">
                <h2 className="service-details__card-title">{t('legal.privacy.c5.title')}</h2>
                <div className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.c1.body') }} />
              </div>
            </div>
          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s2.title')}
            </div>
          </div>

          <div className="accordion mb-5" id="accordionCollecte">

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".3s">
              <div className="global-accordion-header">
                <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#col1" aria-expanded="true">
                  <div className="question">{t('legal.privacy.q1')}</div>
                </div>
              </div>
              <div id="col1" className="global-accordion-collapse collapse show" data-bs-parent="#accordionCollecte">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a1') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".5s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#col2" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q2')}</div>
                </div>
              </div>
              <div id="col2" className="global-accordion-collapse collapse" data-bs-parent="#accordionCollecte">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a2') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".7s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#col3" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q3')}</div>
                </div>
              </div>
              <div id="col3" className="global-accordion-collapse collapse" data-bs-parent="#accordionCollecte">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a3') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".9s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#col4" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q4')}</div>
                </div>
              </div>
              <div id="col4" className="global-accordion-collapse collapse" data-bs-parent="#accordionCollecte">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a4') }} />
              </div>
            </div>

          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s3.title')}
            </div>
          </div>

          <div className="accordion mb-5" id="accordionCookies">

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".3s">
              <div className="global-accordion-header">
                <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#ck1" aria-expanded="true">
                  <div className="question">{t('legal.privacy.q5')}</div>
                </div>
              </div>
              <div id="ck1" className="global-accordion-collapse collapse show" data-bs-parent="#accordionCookies">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a5') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".5s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#ck2" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q6')}</div>
                </div>
              </div>
              <div id="ck2" className="global-accordion-collapse collapse" data-bs-parent="#accordionCookies">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a6') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".7s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#ck3" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q7')}</div>
                </div>
              </div>
              <div id="ck3" className="global-accordion-collapse collapse" data-bs-parent="#accordionCookies">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a7') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".9s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#ck4" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q8')}</div>
                </div>
              </div>
              <div id="ck4" className="global-accordion-collapse collapse" data-bs-parent="#accordionCookies">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a8') }} />
              </div>
            </div>

          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s4.title')}
            </div>
          </div>

          <div className="accordion mb-5" id="accordionPartage">

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".3s">
              <div className="global-accordion-header">
                <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#pt1" aria-expanded="true">
                  <div className="question">{t('legal.privacy.q9')}</div>
                </div>
              </div>
              <div id="pt1" className="global-accordion-collapse collapse show" data-bs-parent="#accordionPartage">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a9') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".5s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#pt2" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q10')}</div>
                </div>
              </div>
              <div id="pt2" className="global-accordion-collapse collapse" data-bs-parent="#accordionPartage">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a10') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".7s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#pt3" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q11')}</div>
                </div>
              </div>
              <div id="pt3" className="global-accordion-collapse collapse" data-bs-parent="#accordionPartage">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a11') }} />
              </div>
            </div>

          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s5.title')}
            </div>
          </div>

          <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-xl-4 col-lg-6 col-md-6">
                <div className="service-details__card h-100">
                  <div className="service-details__card-number" style={{ fontSize: '1rem', color: '#36A9E1', marginBottom: '.5rem' }}>
                    {t(`legal.privacy.retention.${i}.duration`)}
                  </div>
                  <h2 className="service-details__card-title">{t(`legal.privacy.retention.${i}.type`)}</h2>
                  <p className="service-details__card-subtitle">{t(`legal.privacy.retention.${i}.detail`)}</p>
                </div>
              </div>
            ))}
          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s6.title')}
            </div>
          </div>

          <div className="accordion mb-5" id="accordionDroits">

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".3s">
              <div className="global-accordion-header">
                <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#dr1" aria-expanded="true">
                  <div className="question">{t('legal.privacy.q12')}</div>
                </div>
              </div>
              <div id="dr1" className="global-accordion-collapse collapse show" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a12') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".4s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#dr2" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q13')}</div>
                </div>
              </div>
              <div id="dr2" className="global-accordion-collapse collapse" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a13') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".5s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#dr3" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q14')}</div>
                </div>
              </div>
              <div id="dr3" className="global-accordion-collapse collapse" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a14') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".6s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#dr4" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q15')}</div>
                </div>
              </div>
              <div id="dr4" className="global-accordion-collapse collapse" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a15') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".7s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#dr5" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q16')}</div>
                </div>
              </div>
              <div id="dr5" className="global-accordion-collapse collapse" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a16') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".8s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#dr6" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q17')}</div>
                </div>
              </div>
              <div id="dr6" className="global-accordion-collapse collapse" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a17') }} />
              </div>
            </div>

            <div className="global-accordion-item wow fadeInUp" data-wow-delay=".9s">
              <div className="global-accordion-header">
                <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#dr7" aria-expanded="false">
                  <div className="question">{t('legal.privacy.q18')}</div>
                </div>
              </div>
              <div id="dr7" className="global-accordion-collapse collapse" data-bs-parent="#accordionDroits">
                <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.privacy.a18') }} />
              </div>
            </div>

          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s7.title')}
            </div>
          </div>

          <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">

            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="service-details__card h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(54,169,225,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#36A9E1', flexShrink: '0' }}>
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <h2 className="service-details__card-title mb-0">{t('legal.privacy.ct1')}</h2>
                </div>
                <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs6') }} />
              </div>
            </div>

            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="service-details__card h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(54,169,225,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#36A9E1', flexShrink: '0' }}>
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h2 className="service-details__card-title mb-0">{t('legal.privacy.ct2')}</h2>
                </div>
                <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs7') }} />
              </div>
            </div>

            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="service-details__card h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(54,169,225,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#36A9E1', flexShrink: '0' }}>
                    <i className="fa-solid fa-server"></i>
                  </div>
                  <h2 className="service-details__card-title mb-0">{t('legal.privacy.ct3')}</h2>
                </div>
                <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs8') }} />
              </div>
            </div>

            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="service-details__card h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(54,169,225,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#36A9E1', flexShrink: '0' }}>
                    <i className="fa-solid fa-key"></i>
                  </div>
                  <h2 className="service-details__card-title mb-0">{t('legal.privacy.ct4')}</h2>
                </div>
                <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.cs9') }} />
              </div>
            </div>

          </div>

          
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
              {t('legal.privacy.s8.title')}
            </div>
          </div>

          <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">
            <div className="col-xl-12">
              <div className="service-details__card">
                <h2 className="service-details__card-title">{t('legal.privacy.c7.title')}</h2>
                <div className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.privacy.c2.body', { '%date%': today() }) }} />
              </div>
            </div>
          </div>

          
          <div className="faq1__cta text-center" style={{ marginTop: '3rem' }}>
            <p className="faq1__cta-text">{t('legal.privacy.cta_text')}</p>
            <a href={path(locale, 'app_contact')} className="btn btn-info faq1__cta-btn" aria-label={t('legal.privacy.contact_aria')}>
              {t('legal.privacy.cta_button')}
            </a>
          </div>

        </div>
      </div>
    </div>
  </section>
    </PageShell>
  );
}
