import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { asset } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { pageParam, queryParam, staticAlternates, type SearchParams } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** portfolio/index.html.twig (9 projets par page, ?category=<slug>, ?page=N). */
export async function PortfolioIndexPage({ locale, searchParams }: { locale: Locale; searchParams: SearchParams }) {
  const t = translator(locale);
  const categorySlug = queryParam(searchParams, 'category');
  const [projects, categories] = await Promise.all([
    load(
      api.GET('/api/public/{locale}/projects', {
        params: { path: { locale }, query: { page: pageParam(searchParams), ...(categorySlug ? { category: categorySlug } : {}) } },
        fetch: cached('projects'),
      }),
    ).then(members),
    load(api.GET('/api/public/{locale}/project-categories', { params: { path: { locale } }, fetch: cached('project-categories') })).then(members),
  ]);
  // Catégorie inconnue : aucun filtre (comportement du site Symfony).
  const currentCategory = categorySlug ? (categories.find((c) => c.slug === categorySlug) ?? null) : null;

  return (
    <PageShell
      page={{ locale, route: 'app_portfolio_index', alternates: staticAlternates('app_portfolio_index') }}
      seo={{
        pathname: path(locale, 'app_portfolio_index'),
        title: t('portfolio.title'),
        description: t('portfolio.meta_description'),
        ogTitle: t('portfolio.og_title'),
        ogDescription: t('portfolio.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: t('portfolio.jsonld_name'),
              description: t('portfolio.jsonld_description'),
              provider: {
                '@type': 'LocalBusiness',
                name: 'Alivaon',
                address: { '@type': 'PostalAddress', addressLocality: 'Douala', addressCountry: 'CM' },
                telephone: '+237691962158',
              },
              about: { '@type': 'Thing', name: t('portfolio.jsonld_about') },
            }}
          />
        ),
      }}
    >
      <div className="breadcrumb2 overflow-hidden">
        <div className="container rr-container-1600">
          <div className="breadcrumb2-content">
            <span className="breadcrumb2-content__subtitle">{t('portfolio.subtitle')}</span>
            <h1 className="breadcrumb2-content__title">{t('portfolio.h1')}</h1>
            <p className="breadcrumb2-content__heading">{t('portfolio.heading')}</p>
          </div>
        </div>
      </div>

      <section className="portfolio-list section-spacing section-bg rr-ov-hidden pt-0" aria-label={t('portfolio.section_aria')}>
        <div className="container rr-container-1600">
          <div className="portfolio-page__top">
            <div className="portfolio-page__top-item">
              <span className="portfolio-page__top-item-title">{'// '}{currentCategory ? `${t('portfolio.projects_prefix')} ${currentCategory.name}` : t('portfolio.selected')}</span>
            </div>
            <div className="portfolio-page__top-item">
              <a href={path(locale, 'app_portfolio_index')} className={`portfolio-page__top-item-title2${currentCategory ? '' : ' active'}`}>{t('portfolio.all_projects')}</a>
            </div>
            {categories.map((category) => (
              <div key={category.slug} className="portfolio-page__top-item">
                <a
                  href={`${path(locale, 'app_portfolio_index')}?category=${encodeURIComponent(category.slug)}`}
                  className={`portfolio-page__top-item-title2${currentCategory?.slug === category.slug ? ' active' : ''}`}
                >{' '}{category.name}{' '}</a>
              </div>
            ))}
          </div>
          <div className="portfolio-list-wrapper">
            <div className="row g-4 justify-content-center">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.slug} className="col-xl-12">
                    <div className="portfolio-list__card">
                      <div className="portfolio-list__card-thumb">
                        <img src={project.featuredImage ?? asset('build/images/inner/portfolio/portfolio-list-thumb1_1.jpg')} alt={`${project.title} - réalisation Alivaon Douala Cameroun`} />
                      </div>
                      <div className="portfolio-list__card-info">
                        <div className="portfolio-list__card-content">
                          <ul className="portfolio-list__card-content-post">
                            <li className="portfolio-list__card-content-post-date">
                              {twigDate(project.completedAt, 'd M Y')}
                            </li>
                          </ul>
                          <div className="portfolio-list__card-content-items">
                            <h2 className="portfolio-list__card-content-items-title">
                              <a href={path(locale, 'app_portfolio_show', { slug: project.slug })}>{project.title}</a>
                            </h2>
                            <p className="portfolio-list__card-content-items-subtitle">
                              {`${project.category ? `${project.category.name} - ` : ''}${t('portfolio.card_subtitle')}`}
                            </p>
                          </div>
                        </div>
                        <div className="portfolio-list__card-link">
                          <a href={path(locale, 'app_portfolio_show', { slug: project.slug })} className="portfolio-list__card-link-list" aria-label={t('portfolio.details_aria', { '%title%': project.title })}>{' '}{t('portfolio.details')}{' '}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="portfolio-list__card-content-items-subtitle">{t('portfolio.empty')}</p>
                  <a href={path(locale, 'app_portfolio_index')} className="btn btn-info mt-3">{t('portfolio.see_all')}</a>
                </div>
              )}
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '3rem' }}>
            <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('blog.show.cta_button_aria')}>{' '}{t('portfolio.cta_button')}{' '}</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
