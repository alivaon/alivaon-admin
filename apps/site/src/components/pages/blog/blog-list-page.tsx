import { PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members, totalItems } from '@/lib/api';
import { asset } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { pageParam, staticAlternates, type SearchParams } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { Pagination } from './pagination';

const PER_PAGE = 9;

type Filter = { kind: 'category' | 'tag'; slug: string } | null;

/**
 * blog/index.html.twig : liste (/blog), catégorie (/blog/category/{slug}) et
 * tag (/blog/tag/{slug}), 9 articles par page. Catégorie ou tag introuvable
 * dans la langue → 404 (aucun repli sur le slug d'une autre langue).
 */
export async function BlogListPage({ locale, filter, searchParams }: { locale: Locale; filter: Filter; searchParams: SearchParams }) {
  const t = translator(locale);
  const page = pageParam(searchParams);
  const [taxonomy, data] = await Promise.all([
    filter?.kind === 'category'
      ? load(api.GET('/api/public/{locale}/categories/{slug}', { params: { path: { locale, slug: filter.slug } }, fetch: cached('categories') }))
      : filter?.kind === 'tag'
        ? load(api.GET('/api/public/{locale}/tags/{slug}', { params: { path: { locale, slug: filter.slug } }, fetch: cached('tags') }))
        : Promise.resolve(null),
    load(
      api.GET('/api/public/{locale}/articles', {
        params: { path: { locale }, query: { page, itemsPerPage: PER_PAGE, ...(filter ? { [filter.kind]: filter.slug } : {}) } },
        fetch: cached('articles'),
      }),
    ),
  ]);
  const articles = members(data);
  const currentCategory = filter?.kind === 'category' && taxonomy ? (taxonomy as unknown as { name: string; description: string | null }) : null;
  const route = filter?.kind === 'category' ? 'app_blog_by_category' : filter?.kind === 'tag' ? 'app_blog_by_tag' : 'app_blog_index';
  const pathname = filter ? path(locale, route, { slug: filter.slug }) : path(locale, 'app_blog_index');

  return (
    <PageShell
      page={{ locale, route: filter ? null : 'app_blog_index', alternates: taxonomy ? taxonomy.alternates : staticAlternates('app_blog_index') }}
      seo={{ pathname, title: t('blog.index.title'), description: t('blog.index.meta_description') }}
    >
      <main>
        <div className="breadcrumb2 overflow-hidden">
          <div className="container rr-container-1600">
            <div className="breadcrumb2-content">
              <span className="breadcrumb2-content__subtitle">{t('blog.index.subtitle')}</span>{' '}{currentCategory ? (
                <div className="breadcrumb2-content__title">{currentCategory.name}</div>
              ) : (
                <>
                  <div className="breadcrumb2-content__title">{t('blog.index.recent')}</div>
                  <div className="breadcrumb2-content__heading">{t('blog.index.heading')}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {currentCategory?.description && (
          <div style={{ background: '#f8f9fa', borderLeft: '4px solid #4a90e2', padding: '1.25rem 1.75rem', margin: '2rem auto', maxWidth: '900px', borderRadius: '0 6px 6px 0' }}>
            <p style={{ margin: '0', color: '#444', fontSize: '1rem', lineHeight: '1.7' }}>{currentCategory.description}</p>
          </div>
        )}

        <section className="blog-section-5__area">
          <div className="blog-section-5__wrapper section-spacing">
            <div className="container rr-container-1800">
              <div className="blog-section-5__wrap">
                {articles.map((article) => (
                  <div key={article.slug} className="blog-section-5__item">
                    <div className="blog-section-5__meta">
                      <span className="blog-section-5__catagory">{article.category ? article.category.name : t('blog.uncategorized')}</span>{' '}<span className="blog-section-5__time">{t('blog.read_time', { '%minutes%': article.readingTime ?? 6 })}</span>
                    </div>
                    <h3 className="blog-section-5__title">
                      <a href={path(locale, 'app_blog_show', { slug: article.slug })}>{article.title}</a>
                    </h3>
                    <div className="blog-section-5__thumb">
                      <a href={path(locale, 'app_blog_show', { slug: article.slug })}>{' '}<img src={article.featuredImage ?? asset('build/images/inner/blog/blog-5-img-01.jpg')} alt={article.title} />{' '}</a>{' '}<span className="blog-section-5__date">{twigDate(article.publishedAt, 'F d, Y')}</span>
                    </div>
                    <div className="blog-section-5__icon">
                      <a href={path(locale, 'app_blog_show', { slug: article.slug })}>{' '}<i className="fa-solid fa-arrow-right"></i>{' '}</a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pagination-wrap mt-5">
                <Pagination locale={locale} basePath={pathname} searchParams={searchParams} current={page} totalItems={totalItems(data)} perPage={PER_PAGE} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
