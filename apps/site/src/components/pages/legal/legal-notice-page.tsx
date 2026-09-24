import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { absoluteUrl, asset, SITE_ORIGIN } from '@/lib/config';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { staticAlternates, today } from '@/lib/pages';

/** legal/mentions_legales.html.twig */
export function LegalNoticePage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const pathname = path(locale, 'app_mentions_legales');

  return (
    <PageShell
      page={{ locale, route: 'app_mentions_legales', alternates: staticAlternates('app_mentions_legales') }}
      seo={{
        pathname,
        title: t('legal.notice.title'),
        description: t('legal.notice.meta_description'),
        robots: 'index, follow',
        ogTitle: t('legal.notice.og_title'),
        ogDescription: t('legal.notice.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: t('legal.notice.og_title'),
              description: t('legal.notice.og_description'),
              url: absoluteUrl(pathname),
              inLanguage: locale,
              publisher: {
                '@type': 'Organization',
                name: 'Alivaon',
                identifier: 'CM-DLA-01-2026-B12-00421',
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
              <div className="breadcrumb1__top-left">{t('legal.notice.breadcrumb')}</div>
              <div className="breadcrumb1__top-right">
                <div className="breadcrumb1__top-right-img">
                  <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt={t('legal.img_alt_generic')} />
                </div>
                <div className="breadcrumb1__top-right-text">{t('legal.notice.badge')}</div>
              </div>
            </div>
            <h1 className="breadcrumb1__title">{t('legal.notice.h1')}</h1>
          </div>
          <div className="breadcrumb1__thumb rr-ov-hidden wow fadeInUp" data-wow-delay="0.3s">
            <img data-speed="0.9" src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt={t('legal.notice.img_alt')} />
          </div>
        </div>
      
        
        <div className="inner-page section-bg">
          <div className="container rr-container-1800">
            <div className="inner-page__title">{t('legal.notice.section_word')}</div>
            <div className="inner-page__description">
              {t('legal.notice.intro')}
            </div>
          </div>
        </div>
      
        
        <section className="faq1 section-spacing rr-ov-hidden" aria-label={t('legal.notice.aria')}>
          <div className="container rr-container-1600">
            <div className="row gx-60 d-flex justify-content-center">
              <div className="col-xl-12">
      
                
                <div className="faq1__top-section">
                  <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
                    {t('legal.notice.s1.title')}
                  </div>
                </div>
      
                <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">
                  <div className="col-xl-6 col-lg-6 col-md-12">
                    <div className="service-details__card h-100">
                      <h2 className="service-details__card-title">{t('legal.notice.c1.title')}</h2>
                      <div className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.c1.body') }} />
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-12">
                    <div className="service-details__card h-100">
                      <h2 className="service-details__card-title">{t('legal.notice.c2.title')}</h2>
                      <div className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.c2.body') }} />
                    </div>
                  </div>
                </div>
      
                
                <div className="faq1__top-section">
                  <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
                    {t('legal.notice.s2.title')}
                  </div>
                </div>
      
                <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">
                  <div className="col-xl-12">
                    <div className="service-details__card">
                      <h2 className="service-details__card-title">{t('legal.notice.c3.title')}</h2>
                      <div className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.c3.body') }} />
                    </div>
                  </div>
                </div>
      
                
                <div className="faq1__top-section">
                  <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
                    {t('legal.notice.s3.title')}
                  </div>
                </div>
      
                <div className="accordion mb-5" id="accordionPI">
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".3s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#pi1" aria-expanded="true">
                        <div className="question">{t('legal.notice.q1')}</div>
                      </div>
                    </div>
                    <div id="pi1" className="global-accordion-collapse collapse show" data-bs-parent="#accordionPI">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a1') }} />
                    </div>
                  </div>
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".5s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#pi2" aria-expanded="false">
                        <div className="question">{t('legal.notice.q2')}</div>
                      </div>
                    </div>
                    <div id="pi2" className="global-accordion-collapse collapse" data-bs-parent="#accordionPI">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a2') }} />
                    </div>
                  </div>
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".7s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#pi3" aria-expanded="false">
                        <div className="question">{t('legal.notice.q3')}</div>
                      </div>
                    </div>
                    <div id="pi3" className="global-accordion-collapse collapse" data-bs-parent="#accordionPI">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a3') }} />
                    </div>
                  </div>
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".9s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#pi4" aria-expanded="false">
                        <div className="question">{t('legal.notice.q4')}</div>
                      </div>
                    </div>
                    <div id="pi4" className="global-accordion-collapse collapse" data-bs-parent="#accordionPI">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a4') }} />
                    </div>
                  </div>
      
                </div>
      
                
                <div className="faq1__top-section">
                  <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
                    {t('legal.notice.s4.title')}
                  </div>
                </div>
      
                <div className="accordion mb-5" id="accordionResp">
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".3s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#resp1" aria-expanded="true">
                        <div className="question">{t('legal.notice.q5')}</div>
                      </div>
                    </div>
                    <div id="resp1" className="global-accordion-collapse collapse show" data-bs-parent="#accordionResp">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a5') }} />
                    </div>
                  </div>
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".5s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#resp2" aria-expanded="false">
                        <div className="question">{t('legal.notice.q6')}</div>
                      </div>
                    </div>
                    <div id="resp2" className="global-accordion-collapse collapse" data-bs-parent="#accordionResp">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a6') }} />
                    </div>
                  </div>
      
                  <div className="global-accordion-item wow fadeInUp" data-wow-delay=".7s">
                    <div className="global-accordion-header">
                      <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#resp3" aria-expanded="false">
                        <div className="question">{t('legal.notice.q7')}</div>
                      </div>
                    </div>
                    <div id="resp3" className="global-accordion-collapse collapse" data-bs-parent="#accordionResp">
                      <div className="global-accordion-body style" dangerouslySetInnerHTML={{ __html: t('legal.notice.a7') }} />
                    </div>
                  </div>
      
                </div>
      
                
                <div className="faq1__top-section">
                  <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">
                    {t('legal.notice.s5.title')}
                  </div>
                </div>
      
                <div className="row g-4 mb-5 wow fadeInUp" data-wow-delay=".4s">
                  <div className="col-xl-6 col-lg-6 col-md-12">
                    <div className="service-details__card h-100">
                      <h2 className="service-details__card-title">{t('legal.notice.c4.title')}</h2>
                      <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.cs1') }} />
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-12">
                    <div className="service-details__card h-100">
                      <h2 className="service-details__card-title">{t('legal.notice.c5.title')}</h2>
                      <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.cs2') }} />
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-12">
                    <div className="service-details__card h-100">
                      <h2 className="service-details__card-title">{t('legal.notice.c6.title')}</h2>
                      <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.cs3') }} />
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-12">
                    <div className="service-details__card h-100">
                      <h2 className="service-details__card-title">{t('legal.notice.c7.title')}</h2>
                      <p className="service-details__card-subtitle" dangerouslySetInnerHTML={{ __html: t('legal.notice.cs4', { '%date%': today() }) }} />
                    </div>
                  </div>
                </div>
      
                
                <div className="faq1__cta text-center" style={{ marginTop: '3rem' }}>
                  <p className="faq1__cta-text">{t('legal.notice.cta_text')}</p>
                  <a href={path(locale, 'app_contact')} className="btn btn-info faq1__cta-btn" aria-label={t('legal.notice.contact_aria')}>{' '}{t('legal.notice.cta_button')}{' '}</a>
                </div>
      
              </div>
            </div>
          </div>
        </section>
      
    </PageShell>
  );
}
