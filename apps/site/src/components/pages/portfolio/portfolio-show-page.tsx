import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { stripTags, twigEscape } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** portfolio/show.html.twig */
export async function PortfolioShowPage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = translator(locale);
  const project = await load(api.GET('/api/public/{locale}/projects/{slug}', { params: { path: { locale, slug } }, fetch: cached('projects') }));
  const imageName = project.featuredImage ?? 'x.jpg';
  const location = project.location || `Douala, ${t('common.cameroon')}`;

  return (
    <PageShell
      page={{ locale, route: 'app_portfolio_show', alternates: project.alternates }}
      seo={{
        pathname: path(locale, 'app_portfolio_show', { slug }),
        title: `${project.title} - ${t('portfolio.show.title_suffix')}`,
        description: `${project.title} : ${t('portfolio.show.meta_suffix')}`,
        ogTitle: `${project.title} - ${t('portfolio.show.og_title_suffix')}`,
        ogDescription: t('portfolio.show.og_description', { '%title%': project.title }),
        ogType: 'article',
        ogImage: absoluteUrl(project.featuredImage ?? asset('build/images/inner/portfolio-details/portfolio-details-thumb1_1.jpg')),
        ogImageType: imageName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        ogImageAlt: `${project.title} - Alivaon`,
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'CreativeWork',
              // Sans json_encode dans le gabarit : échappement HTML de Twig.
              name: twigEscape(project.title),
              description: `${project.title} - ${t('portfolio.show.jsonld_description')}`,
              creator: {
                '@type': 'LocalBusiness',
                name: 'Alivaon',
                address: { '@type': 'PostalAddress', addressLocality: 'Douala', addressCountry: 'CM' },
                telephone: '+237691962158',
              },
              locationCreated: { '@type': 'Place', name: twigEscape(location) },
              ...(project.completedAt ? { dateCreated: twigDate(project.completedAt, 'Y-m-d') } : {}),
            }}
          />
        ),
      }}
    >
      <section className="portfolio-details rr-ov-hidden">
    <div className="container rr-container-1600">
      <div className="row">
        <div className="col-xl-12">
          <div className="portfolio-details__top">
            <h1 className="portfolio-details__top-title">{project.title}</h1>
          </div>
          <div className="portfolio-details__items">
            {(project.category) ? (
<>

              <div className="portfolio-details__items-content">
                <span className="portfolio-details__items-content-subtitle">{t('portfolio.show.category')}</span>
                <p className="portfolio-details__items-content-title">{project.category?.name}</p>
              </div>
            
</>
) : null}{' '}{(project.client) ? (
<>

              <div className="portfolio-details__items-content">
                <span className="portfolio-details__items-content-subtitle">{t('portfolio.show.client')}</span>
                <p className="portfolio-details__items-content-title">{project.client}</p>
              </div>
            
</>
) : null}{' '}{(project.completedAt) ? (
<>

              <div className="portfolio-details__items-content">
                <span className="portfolio-details__items-content-subtitle">{t('portfolio.show.year')}</span>
                <p className="portfolio-details__items-content-title">{twigDate(project.completedAt, 'Y')}</p>
              </div>
            
</>
) : null}
            <div className="portfolio-details__items-content">
              <span className="portfolio-details__items-content-subtitle">{t('portfolio.show.location')}</span>
              <p className="portfolio-details__items-content-title">{project.location || `Douala, ${t('common.cameroon')}`}</p>
            </div>
            {(project.technologies && project.technologies.length > 0) ? (
<>

              <div className="portfolio-details__items-content">
                <span className="portfolio-details__items-content-subtitle">{t('portfolio.show.technologies')}</span>
                <p className="portfolio-details__items-content-title">
                  {(Array.isArray(project.technologies)) ? (
<>

                    {(project.technologies ?? []).join(', ')}
                  
</>
) : (
<>

                    {project.technologies}
                  
</>
)}
                </p>
              </div>
            
</>
) : null}
          </div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        <div className="col-xl-12">
          <div className="portfolio-details__thumb">
            <img src={project.featuredImage ?? asset('build/images/inner/portfolio-details/portfolio-details-thumb1_1.jpg')} alt={`${project.title} - projet digital réalisé par Alivaon à Douala, Cameroun`} />
          </div>
        </div>
      </div>
    </div>

    <div className="container rr-container-1600">
      <div className="portfolio-details__info">
        <div className="row g-4 d-flex justify-content-center">
          <div className="col-xl-6 col-lg-4">
            <div className="portfolio-details__info-left">{t('portfolio.show.about')}</div>
          </div>
          <div className="col-xl-6 col-lg-8">
            <div className="portfolio-details__info-right">
              <h2 className="portfolio-details__info-right-title">{t('portfolio.show.context')}</h2>
              {(project.description) ? (
<>

                <div className="portfolio-details__info-right-subtitle1" dangerouslySetInnerHTML={{ __html: project.description ?? '' }} />
                {(project.challenge) ? (
<>

                  <p className="portfolio-details__info-right-subtitle2">{stripTags(project.challenge ?? '')}</p>
                
</>
) : null}
              
</>
) : (
<>

                <p className="portfolio-details__info-right-subtitle1">{t('portfolio.show.desc_fallback1')}</p>
                <p className="portfolio-details__info-right-subtitle2">{t('portfolio.show.desc_fallback2')}</p>
              
</>
)}
              <div className="accordion2" id="accordionExample">
                <div className="global-accordion-item2 border-tp wow fadeInUp" data-wow-delay=".3s">
                  <div className="global-accordion-header">
                    <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      <div className="question">{project.steps[0]?.title || t('portfolio.show.step1_title')}</div>
                    </div>
                  </div>
                  <div id="collapseOne" className="global-accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="global-accordion-body style">
                      <p>{stripTags(project.steps[0]?.content || t('portfolio.show.step1_content'))}</p>
                    </div>
                  </div>
                </div>
                <div className="global-accordion-item2 border-tp wow fadeInUp" data-wow-delay=".5s">
                  <div className="global-accordion-header">
                    <div className="global-accordion-button style" data-bs-toggle="collapse" role="group" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      <div className="question">{project.steps[1]?.title || t('portfolio.show.step2_title')}</div>
                    </div>
                  </div>
                  <div id="collapseTwo" className="global-accordion-collapse collapse show" data-bs-parent="#accordionExample">
                    <div className="global-accordion-body style">
                      <p>{stripTags(project.steps[1]?.content || t('portfolio.show.step2_content'))}</p>
                    </div>
                  </div>
                </div>
                <div className="global-accordion-item2 border-tp wow fadeInUp" data-wow-delay=".7s">
                  <div className="global-accordion-header">
                    <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                      <div className="question">{project.steps[2]?.title || t('portfolio.show.step3_title')}</div>
                    </div>
                  </div>
                  <div id="collapseThree" className="global-accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="global-accordion-body style">
                      <p>{stripTags(project.steps[2]?.content || t('portfolio.show.step3_content'))}</p>
                    </div>
                  </div>
                </div>
                <div className="global-accordion-item2 border-tp border-bm wow fadeInUp" data-wow-delay=".9s">
                  <div className="global-accordion-header">
                    <div className="global-accordion-button collapsed style" data-bs-toggle="collapse" role="group" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                      <div className="question">{project.steps[3]?.title || t('portfolio.show.step4_title')}</div>
                    </div>
                  </div>
                  <div id="collapseFour" className="global-accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="global-accordion-body style">
                      <p>{stripTags(project.steps[3]?.content || t('portfolio.show.step4_content'))}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="container rr-container-1600">
      <div className="row g-4 d-flex justify-content-center">
        <div className="col-xl-8 col-lg-8 col-md-8">
          <div className="portfolio-details__thumb2">
            <img src={project.images[0] ?? asset('build/images/inner/portfolio-details/portfolio-details-thumb1_2.png')} alt={`${project.title} - interface logiciel développé par Alivaon, Douala`} />
          </div>
        </div>
        <div className="col-xl-4 col-lg-4 col-md-4">
          <div className="portfolio-details__thumb2">
            <img src={project.images[1] ?? asset('build/images/inner/portfolio-details/portfolio-details-thumb1_3.jpg')} alt={`${project.title} - application mobile Android, Cameroun`} />
          </div>
        </div>
      </div>
    </div>

    <div className="container rr-container-1600">
      <div className="portfolio-details-wrapper">
        <div className="row g-4 d-flex justify-content-center">
          <div className="col-xl-5 col-lg-4">
            <div className="portfolio-details-wrapper__title">{t('portfolio.show.approach')}</div>
          </div>
          <div className="col-xl-7 col-lg-8">
            <div className="portfolio-details__content">
              <h2 className="portfolio-details__content-title">{t('portfolio.show.solution')}</h2>
              <p className="portfolio-details__content-subtitle1">{stripTags(project.approach || t('portfolio.show.approach_fallback'))}</p>
              {(project.approachDetail) ? (
<>

                <p className="portfolio-details__content-subtitle2">{stripTags(project.approachDetail ?? '')}</p>
              
</>
) : (
<>

                <p className="portfolio-details__content-subtitle2">{t('portfolio.show.approach_detail_fallback')}</p>
              
</>
)}
            </div>
          </div>
        </div>
      </div>
      <div className="portfolio-details-info2">
        <div className="row g-4 d-flex justify-content-center">
          <div className="col-xl-5 col-lg-4">
            <div className="portfolio-details-wrapper__title">{t('portfolio.show.results')}</div>
          </div>
          <div className="col-xl-7 col-lg-8">
            <div className="portfolio-details__content">
              <h2 className="portfolio-details__content-title">{t('portfolio.show.impact')}</h2>
              <div className="portfolio-details__content-subtitle1" dangerouslySetInnerHTML={{ __html: project.results || t('portfolio.show.results_fallback') }} />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="container rr-container-1600">
      <div className="row">
        <div className="col-xl-12">
          <div className="portfolio-details__thumb3">
            <img src={project.images[2] ?? asset('build/images/inner/portfolio-details/portfolio-details-thumb1_4.jpg')} alt={`Résultat du projet ${project.title} - solution digitale Alivaon au Cameroun`} />
          </div>
        </div>
      </div>
    </div>

    <div className="container rr-container-1600">
      <div className="row">
        <div className="col-xl-12">
          <div className="portfolio-details__link">
            {(project.previous) ? (
<>

              <a href={path(locale, 'app_portfolio_show', { slug: project.previous!.slug })} className="portfolio-details__link-items">
                <div className="button">{t('portfolio.show.prev')}
                  <div className="icon">
                    <svg width="17" height="25" viewBox="0 0 17 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M15.6087 23.8009L0.431641 0.270996C1.37659 1.89415 2.32189 8.74676 0.809931 11.9268" stroke="black" />
                    </svg>
                  </div>
                </div>
              </a>
            
</>
) : (
<>

              <a href={path(locale, 'app_portfolio_index')} className="portfolio-details__link-items">
                <div className="button">{t('portfolio.see_all')}
                  <div className="icon">
                    <svg width="17" height="25" viewBox="0 0 17 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M15.6087 23.8009L0.431641 0.270996C1.37659 1.89415 2.32189 8.74676 0.809931 11.9268" stroke="black" />
                    </svg>
                  </div>
                </div>
              </a>
            
</>
)}{' '}{(project.next) ? (
<>

              <a href={path(locale, 'app_portfolio_show', { slug: project.next!.slug })} className="portfolio-details__link-items">
                <div className="button">{t('portfolio.show.next')}
                  <div className="icon">
                    <svg width="17" height="25" viewBox="0 0 17 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M0.420549 23.8009L15.5977 0.270996C14.6527 1.89415 13.7074 8.74676 15.2194 11.9268" stroke="black" />
                    </svg>
                  </div>
                </div>
              </a>
            
</>
) : (
<>

              <a href={path(locale, 'app_portfolio_index')} className="portfolio-details__link-items">
                <div className="button">{t('portfolio.see_all')}
                  <div className="icon">
                    <svg width="17" height="25" viewBox="0 0 17 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M0.420549 23.8009L15.5977 0.270996C14.6527 1.89415 13.7074 8.74676 15.2194 11.9268" stroke="black" />
                    </svg>
                  </div>
                </div>
              </a>
            
</>
)}
          </div>

          
          <div className="text-center" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1rem' }}>{t('portfolio.show.cta_text')}</p>
            <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('blog.show.cta_button_aria')}>{' '}{t('blog.show.cta_button')}{' '}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
    </PageShell>
  );
}
