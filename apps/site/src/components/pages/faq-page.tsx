import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { asset } from '@/lib/config';
import { staticAlternates, stripTags } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** faq/index.html.twig */
export async function FaqPage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const faqs = members(await load(api.GET('/api/public/{locale}/faqs', { params: { path: { locale } }, fetch: cached('faqs') })));

  return (
    <PageShell
      page={{ locale, route: 'app_faq', alternates: staticAlternates('app_faq') }}
      bodyBackground="#f6f0e9"
      seo={{
        pathname: path(locale, 'app_faq'),
        title: t('faq.title'),
        description: t('faq.meta_description'),
        ogTitle: t('faq.og_title'),
        ogDescription: t('faq.og_description'),
        // Schéma FAQPage : FAQ réellement publiées dans la locale de la page.
        extra: (
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
        ),
      }}
    >
      <main>

  
  <div className="breadcrumb1 section-bg overflow-hidden pb-0">
    <div className="container rr-container-1600">
      <div className="breadcrumb1__top">
        <div className="breadcrumb1__top-left">FAQ</div>
        <div className="breadcrumb1__top-right">
          <div className="breadcrumb1__top-right-img">
            <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt="Alivaon agence digitale Douala Cameroun" />
          </div>
          <div className="breadcrumb1__top-right-text">{t('faq.breadcrumb')}</div>
        </div>
      </div>
      <h1 className="breadcrumb1__title">{t('faq.h1')}</h1>
    </div>
    <div className="breadcrumb1__thumb">
      <img src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt="Développement logiciel et application mobile à Douala, Cameroun - Alivaon" />
    </div>
  </div>

  
  <section className="project section-spacing rr-ov-hidden" aria-label={t('faq.cards_aria')}>
    <div className="container">
      <div className="row g-4 justify-content-center">
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project__card">
            <h2 className="project__card-title">{t('faq.card1.title')}</h2>
            <p className="project__card-subtitle">{t('faq.card1.text')}</p>
            <div className="project__card-button"></div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project__card">
            <h2 className="project__card-title">{t('faq.card2.title')}</h2>
            <p className="project__card-subtitle">{t('faq.card2.text')}</p>
            <div className="project__card-button"></div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project__card">
            <h2 className="project__card-title">{t('faq.card3.title')}</h2>
            <p className="project__card-subtitle">{t('faq.card3.text')}</p>
            <div className="project__card-button"></div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project__card">
            <h2 className="project__card-title">{t('faq.card4.title')}</h2>
            <p className="project__card-subtitle">{t('faq.card4.text')}</p>
            <div className="project__card-button"></div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project__card">
            <h2 className="project__card-title">{t('faq.card5.title')}</h2>
            <p className="project__card-subtitle">{t('faq.card5.text')}</p>
            <div className="project__card-button"></div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project__card">
            <h2 className="project__card-title">{t('faq.card6.title')}</h2>
            <p className="project__card-subtitle">{t('faq.card6.text')}</p>
            <div className="project__card-button"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <div className="faq1 section-spacing rr-ov-hidden">
    <div className="container rr-container-1600">
      <div className="row gx-60 d-flex justify-content-center">
        <div className="col-xl-12">
          <div className="faq1__top-section">
            <div className="faq1__top-section-title wow fadeInUp" data-wow-delay=".3s">{t('faq.accordion_title')}</div>
          </div>
          <div className="accordion" id="accordionFaq">

            {faqs.map((faq, index) => (
              <div key={faq.id} className="global-accordion-item wow fadeInUp" data-wow-delay={`${(index + 1) * 0.2}s`}>
                <div className="global-accordion-header">
                  <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target={`#faq${faq.id}`} aria-expanded="false">
                    <div className="question">
                      {index + 1}. {faq.question}
                    </div>
                  </div>
                </div>
                <div id={`faq${faq.id}`} className="global-accordion-collapse collapse" data-bs-parent="#accordionFaq">
                  <div className="global-accordion-body style">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>

          
          <div className="faq1__cta text-center" style={{ marginTop: '3rem' }}>
            <p className="faq1__cta-text">{t('faq.cta_text')}</p>
            <a href={path(locale, 'app_contact')} className="btn btn-info faq1__cta-btn" aria-label={t('faq.cta_button_aria')}>{' '}{t('faq.cta_button')}{' '}</a>
          </div>

        </div>
      </div>
    </div>
  </div>

</main>
    </PageShell>
  );
}
