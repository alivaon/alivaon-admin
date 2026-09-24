import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { sliceChars, twigEscape, urlEncode } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { commentScript, OEMBED_SCRIPT, viewScript } from './blog-show-scripts';

/** blog/show.html.twig */
export async function BlogShowPage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = translator(locale);
  const [article, latest, categories, tags] = await Promise.all([
    load(api.GET('/api/public/{locale}/articles/{slug}', { params: { path: { locale, slug } }, fetch: cached('articles') })),
    load(api.GET('/api/public/{locale}/articles', { params: { path: { locale }, query: { itemsPerPage: 5 } }, fetch: cached('articles') })).then(members),
    load(api.GET('/api/public/{locale}/categories', { params: { path: { locale } }, fetch: cached('categories') })).then(members),
    load(api.GET('/api/public/{locale}/tags', { params: { path: { locale } }, fetch: cached('tags') })).then(members),
  ]);
  // Articles similaires : les 5 derniers, article courant écarté, 4 au plus (contrôleur).
  const related = latest.filter((a) => a.slug !== article.slug).slice(0, 4);
  const recent = latest;
  const articleUrl = absoluteUrl(path(locale, 'app_blog_show', { slug: article.slug }));
  const shareUrl = urlEncode(articleUrl);
  const shareTitle = urlEncode(article.title);
  const imageName = article.featuredImage ?? 'x.jpg';

  return (
    <PageShell
      page={{ locale, route: 'app_blog_show', alternates: article.alternates }}
      bodyBackground="#F0F2F4"
      pageScripts={[{ inline: viewScript(locale, slug) }]}
      seo={{
        pathname: path(locale, 'app_blog_show', { slug }),
        title: `${article.title} | ${t('blog.show.title_suffix')}`,
        description: article.excerpt ? article.excerpt : t('blog.show.meta_fallback'),
        ogTitle: article.title,
        ogDescription: article.excerpt ? article.excerpt : t('blog.show.og_desc_fallback'),
        ogType: 'article',
        ogImage: absoluteUrl(article.featuredImage ?? asset('build/images/inner/blog-details/blog-details-thumb1_4.jpg')),
        ogImageType: imageName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        ogImageAlt: article.title,
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              // Sans json_encode dans le gabarit : échappement HTML de Twig.
              headline: twigEscape(article.title),
              description: twigEscape(article.excerpt ? article.excerpt : 'Conseils pour digitaliser votre entreprise au Cameroun.'),
              datePublished: article.publishedAt ? twigDate(article.publishedAt, 'Y-m-d') : '2025-01-01',
              author: { '@type': 'Organization', name: 'Alivaon' },
              publisher: {
                '@type': 'LocalBusiness',
                name: 'Alivaon',
                address: { '@type': 'PostalAddress', addressLocality: 'Douala', addressCountry: 'CM' },
                telephone: '+237691962158',
              },
              inLanguage: locale === 'en' ? 'en' : 'fr-CM',
            }}
          />
        ),
      }}
    >
      <main>

  
  <div className="blog-details__top">
    {(article.featuredImage) ? (
<>

      <img src={`/uploads/articles/${article.featuredImage!.replace(/^\/uploads\/articles\//, '')}`} alt={`${article.title} - article blog Alivaon Cameroun`} />
    
</>
) : (
<>

      <img src={asset('build/images/inner/blog-details/blog-details-thumb1_4.jpg')} alt="Blog Alivaon - conseils digitalisation pour PME camerounaises" />
    
</>
)}
  </div>

  
  <div className="blog-details section-spacing section-bg fix">
    <div className="container rr-container-1350">

      <div className="blog-details__up">
        <div className="row d-flex align-items-center justify-content-center">
          <div className="col-xl-6">
            <div className="blog-details__up-wrap">
              <div className="blog-details__subtitle">
                {(article.category) ? (
<>

                  {article.category!.name}
                
</>
) : (
<>

                  {t('blog.show.default_category')}
                
</>
)}
              </div>
              <div className="blog-details__date">
                {(true) ? (
<>

                  {twigDate(article.publishedAt, 'd F Y')}
                
</>
) : (
<>

                  {twigDate('2025-03-15', 'd F Y')}
                
</>
)}
              </div>
              <h1 className="blog-details__title">
                {(true) ? (
<>

                  {article.title}
                
</>
) : (
<>

                  {t('blog.show.title_placeholder')}
                
</>
)}
              </h1>
              <div className="blog-details__author">
                <div className="blog-details__author-item">
                  <div className="blog-details__author-thumb">
                    {(article.author?.avatar) ? (
<>

                      <img src={`/uploads/authors/${article.author!.avatar!.replace(/^\/uploads\/authors\//, '')}`} alt={`${article.author!.name} - Alivaon Douala`} />
                    
</>
) : (
<>

                      <img src={asset('build/images/inner/blog-details/blog-details-mentor1_1.png')} alt={t('blog.show.team_alt1')} />
                    
</>
)}
                  </div>
                  <div className="blog-details__author-content">
                    <div className="title">{t('blog.show.written_by')}</div>
                    <div className="name">
                      {(article.author) ? (
<>

                        {article.author!.name}
                      
</>
) : (
<>

                        {t('blog.show.author_fallback')}
                      
</>
)}
                    </div>
                  </div>
                </div>
                <div className="blog-details__author-item2">
                  <div className="blog-details__author-content">
                    <div className="view">{t('blog.show.reading')}</div>
                    <div className="time">
                      {(article.readingTime) ? (
<>

                        {article.readingTime} min
                      
</>
) : (
<>

                        {t('blog.read_time', {'%minutes%': 6})}
                      
</>
)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-5 justify-content-center">
        
        <div className="col-12 col-xl-8 col-lg-8">
          <div className="blog-details-wrapper">
            <div className="blog-details-wrapper-items">
              
              <div className="blog-details-wrapper-items-content article-body wow fadeInUp" data-wow-delay=".7s" id="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />
              <script dangerouslySetInnerHTML={{ __html: OEMBED_SCRIPT }} />

              
              <div className="blog-details-wrapper-items-tag__border wow fadeInUp" data-wow-delay=".5s" style={{ marginTop: '2rem' }}>
                <div className="row">
                  <div className="col-lg-8 col-12">
                    <div className="blog-details-wrapper-items-tag__tagcloud">
                      <div className="blog-details-wrapper-items-tag__tagcloud-title">{t('blog.show.tags')}</div>
                      {(article.tags.length > 0) ? (
<>

                        {(article.tags).map((tag, i0) => (
<Fragment key={i0}>{' '}<a className="blog-details-wrapper-items-tag__tagcloud-button" href={path(locale, 'app_blog_index')}>{tag.name}</a>{' '}</Fragment>
))}
                      
</>
) : null}
                    </div>
                  </div>
                  <div className="col-lg-4 col-12 mt-3 mt-lg-0 d-flex text-lg-end">
                    <div className="blog-details-wrapper-items-tag__title">{t('blog.show.share')}</div>
                    <div className="blog-details-wrapper-items-tag__social d-flex justify-content-end">
                      {null}{' '}{null}{' '}<a className="blog-details-wrapper-items-tag__social-icon" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label={t('blog.show.share_on', {'%network%': 'Facebook'})}><i className="fab fa-facebook-f"></i></a>{' '}<a className="blog-details-wrapper-items-tag__social-icon" href={`https://x.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label={t('blog.show.share_on', {'%network%': 'X'})}><i className="fa-brands fa-x-twitter"></i></a>{' '}<a className="blog-details-wrapper-items-tag__social-icon" href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label={t('blog.show.share_on', {'%network%': 'LinkedIn'})}><i className="fa-brands fa-linkedin-in"></i></a>{' '}<a className="blog-details-wrapper-items-tag__social-icon" href={`https://wa.me/?text=${urlEncode(`${article.title} ${articleUrl}`)}`} target="_blank" rel="noopener noreferrer" aria-label={t('blog.show.share_on', {'%network%': 'WhatsApp'})}><i className="fa-brands fa-whatsapp"></i></a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="blog-details-wrapper-items-mentor">
                <div className="blog-details-wrapper-items-mentor__thumb">
                  {(article.author?.avatar) ? (
<>

                    <img src={`/uploads/authors/${article.author!.avatar!.replace(/^\/uploads\/authors\//, '')}`} alt={`${article.author!.name} - Alivaon Douala`} />
                  
</>
) : (
<>

                    <img src={asset('build/images/inner/blog-details/blog-details-mentor1_4.png')} alt={t('blog.show.team_alt2')} />
                  
</>
)}
                </div>
                <div className="blog-details-wrapper-items-mentor__content">
                  <div className="blog-details-wrapper-items-mentor__content-title">
                    {(article.author) ? (
<>

                      {article.author!.name}
                    
</>
) : (
<>

                      {t('blog.show.author_fallback')}
                    
</>
)}
                  </div>
                  {null}
                  <p className="blog-details-wrapper-items-mentor__content-subtitle">
                    {(article.author?.bio) ? (
<>

                      {article.author!.bio}
                    
</>
) : (
<>

                      {t('blog.show.author_bio_fallback')}
                    
</>
)}
                  </p>
                </div>
              </div>

              
              

              
              <div className="blog-details-wrapper-items-comments">
                <div className="blog-details-wrapper-items-comments__heading">
                  {t('blog.show.comments_count', { '%count%': article.comments.length })}
                </div>

                {(article.comments).length > 0 ? (article.comments).map((comment, i1) => (
<Fragment key={i1}>

                  <div className="blog-details-wrapper-items-comments-single wow fadeInUp" data-wow-delay=".3s" id={`comment-${comment.id}`}>
                    <div className="blog-details-wrapper-items-comment-single__thumb blog-details-wrapper-items-comment-single__thumb--initials">
                      {sliceChars(comment.authorName, 0, 1).toUpperCase()}
                    </div>
                    <div className="blog-details-wrapper-items-comments-single-content">
                      <div className="blog-details-wrapper-items-comments-single-content-head d-flex gap-2 align-items-center justify-content-between">
                        <div className="blog-details-wrapper-items-comments-single-content-head__con">
                          <div className="blog-details-wrapper-items-comments-single-content-head__con-title">{comment.authorName}</div>
                        </div>
                        <div className="blog-details-wrapper-items-comments-single-content-head__con-date d-flex align-items-center gap-3">
                          {twigDate(comment.createdAt, 'd/m/Y')}{' '}<a href="#comment-form" className="comment-reply-btn" data-comment-id={comment.id} data-author-name={comment.authorName} style={{ fontSize: '0.82rem', color: '#36A9E1', textDecoration: 'none' }}>{' '}<i className="fa fa-reply me-1"></i>{t('blog.show.reply')}{' '}</a>
                        </div>
                      </div>
                      <p className="blog-details-wrapper-items-comments-single-content__text">{comment.content}</p>

                      
                      {null}{' '}{(comment.replies.length > 0) ? (
<>

                        <div className="comment-replies" style={{ marginLeft: '2.5rem', marginTop: '1rem', borderLeft: '3px solid #36A9E1', paddingLeft: '1rem' }}>
                          {(comment.replies).map((reply, i2) => (
<Fragment key={i2}>

                            <div className="blog-details-wrapper-items-comments-single" style={{ marginBottom: '1rem' }}>
                              <div className="blog-details-wrapper-items-comment-single__thumb blog-details-wrapper-items-comment-single__thumb--initials" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                                {sliceChars(reply.authorName, 0, 1).toUpperCase()}
                              </div>
                              <div className="blog-details-wrapper-items-comments-single-content">
                                <div className="blog-details-wrapper-items-comments-single-content-head d-flex gap-2 align-items-center justify-content-between">
                                  <div className="blog-details-wrapper-items-comments-single-content-head__con-title" style={{ fontSize: '0.9rem' }}>
                                    {reply.authorName}
                                  </div>
                                  <div className="blog-details-wrapper-items-comments-single-content-head__con-date" style={{ fontSize: '0.8rem' }}>
                                    {twigDate(reply.createdAt, 'd/m/Y')}
                                  </div>
                                </div>
                                <p className="blog-details-wrapper-items-comments-single-content__text" style={{ fontSize: '0.9rem' }}>{reply.content}</p>
                              </div>
                            </div>
                          
</Fragment>
))}
                        </div>
                      
</>
) : null}
                    </div>
                  </div>
                
</Fragment>
)) : (
<>

                  <p className="blog-details-wrapper-items-comments__empty">{t('blog.show.no_comments')}</p>
                
</>
)}
              </div>

              
              <div className="blog-details-wrapper-items-form" id="comment-form">
                <div className="blog-details-wrapper-items-form__title" id="comment-form-title">{t('blog.show.leave_comment')}</div>
                <div id="comment-reply-notice" style={{ display: 'none', marginBottom: '1rem', padding: '.5rem 1rem', background: 'rgba(65,246,129,.1)', borderLeft: '3px solid #36A9E1', borderRadius: '4px' }}>
                  <span id="comment-reply-text"></span>{' '}<a href="#comment-form" id="comment-cancel-reply" style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#888', textDecoration: 'underline' }}>{t('common.cancel')}</a>
                </div>

                <form name="comment" method="post" action={`/api/public/${locale}/articles/${encodeURIComponent(slug)}/comments`} noValidate>
                  <input type="hidden" id="comment_parentId" name="parentId" />
                  <div className="row g-4">
                    <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
                      <div className="blog-details-wrapper-items-form__contact-clt">
                        <input type="text" id="comment_authorName" name="authorName" required placeholder={t('comment.form.name_placeholder')} className="blog-details-wrapper-items-form__contact-input" />
                                              </div>
                    </div>
                    <div className="col-lg-6 wow fadeInUp" data-wow-delay=".5s">
                      <div className="blog-details-wrapper-items-form__contact-clt">
                        <input type="email" id="comment_authorEmail" name="authorEmail" required placeholder={t('comment.form.email_placeholder')} className="blog-details-wrapper-items-form__contact-input" />
                                              </div>
                    </div>
                    <div className="col-lg-12 wow fadeInUp" data-wow-delay=".9s">
                      <div className="blog-details-wrapper-items-form__contact-clt">
                        <textarea id="comment_content" name="content" required placeholder={t('comment.form.content_placeholder')} rows={5} className="blog-details-wrapper-items-form__contact-input"></textarea>
                                              </div>
                    </div>
                    <div className="col-lg-6 wow fadeInUp" data-wow-delay="1s">
                      <div className="contact3-form__button">
                        <button type="submit" className="rr-btn-button2 btn-purple">{' '}<span className="text">{t('common.send')}</span>{' '}<span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                              <g clipPath="url(#clip_comment_btn)">
                                <path d="M22.0004 11C16.6011 11 12.2227 6.07578 12.2227 0" stroke="white" strokeWidth="2" strokeMiterlimit="10"></path>
                                <path d="M12.2227 22C12.2227 15.9258 16.5997 11 22.0004 11" stroke="white" strokeWidth="2" strokeMiterlimit="10"></path>
                                <path d="M22.0005 11H0.000488281" stroke="white" strokeWidth="2" strokeMiterlimit="10"></path>
                              </g>
                              <defs>
                                <clipPath id="clip_comment_btn">
                                  <rect width="22" height="22" fill="white"></rect>
                                </clipPath>
                              </defs>
                            </svg>
                          </span>{' '}</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <script dangerouslySetInnerHTML={{ __html: commentScript(locale, slug) }} />

            </div>
          </div>

          
          {(related.length > 0) ? (
<>

            <div className="blog-related section-spacing-top">
              <h2 className="blog-related__title">{t('blog.show.related')}</h2>
              <div className="row g-4">
                {(related).map((related, i3) => (
<Fragment key={i3}>

                  <div className="col-md-6">
                    <div className="blog-section-5__item">
                      <div className="blog-section-5__meta">
                        <span className="blog-section-5__catagory">{related.category ? related.category.name : t('blog.uncategorized')}</span>
                      </div>
                      <h3 className="blog-section-5__title"><a href={path(locale, 'app_blog_show', { slug: related.slug })}>{related.title}</a></h3>
                      <div className="blog-section-5__thumb">
                        <a href={path(locale, 'app_blog_show', { slug: related.slug })}>{' '}<img src={related.featuredImage ?? asset('build/images/inner/blog/blog-5-img-01.jpg')} alt={`${related.title} - article blog Alivaon Cameroun`} />{' '}</a>
                      </div>
                      <div className="blog-section-5__icon">
                        <a href={path(locale, 'app_blog_show', { slug: related.slug })} aria-label={t('blog.show.read_article', { '%title%': related.title })}><i className="fa-solid fa-arrow-right"></i></a>
                      </div>
                    </div>
                  </div>
                
</Fragment>
))}
              </div>
            </div>
          
</>
) : null}

          
          <div className="text-center" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1rem' }}>{t('blog.show.cta_text')}</p>
            <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('blog.show.cta_button_aria')}>{' '}{t('blog.show.cta_button')}{' '}</a>
          </div>

        </div>

        
        <div className="col-12 col-xl-4 col-lg-4">
          <div className="main-sidebar2">

            <div className="main-sidebar2-widget">
              <div className="main-sidebar2-widget__heading wow fadeInUp" data-wow-delay=".3s">
                <div className="main-sidebar2-widget__heading-title">{t('blog.sidebar.search')}</div>
              </div>
              <div className="main-sidebar2-widget__search-widget wow fadeInUp" data-wow-delay=".5s">
                <form action={path(locale, 'app_blog_index')} method="get">
                  <input type="text" name="q" placeholder={t('blog.sidebar.search_placeholder')} />{' '}<button type="submit" aria-label={t('blog.sidebar.search')}>
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 16C9.775 15.9998 11.4989 15.4056 12.897 14.312L17.293 18.708L18.707 17.294L14.311 12.898C15.4051 11.4997 15.9997 9.77546 16 8C16 3.589 12.411 0 8 0C3.589 0 0 3.589 0 8C0 12.411 3.589 16 8 16ZM8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2Z" fill="white" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            
            {(categories.length > 0) ? (
<>

              <div className="main-sidebar2-widget">
                <div className="main-sidebar2-widget__heading wow fadeInUp" data-wow-delay=".3s">
                  <div className="main-sidebar2-widget__heading-title">{t('blog.sidebar.categories')}</div>
                </div>
                <div className="main-sidebar2-widget__categories">
                  <ul>
                    {(categories).map((cat, i4) => (
<Fragment key={i4}>

                      <li>
                        
                        <a href={path(locale, 'app_blog_by_category', { slug: cat.slug })}>{' '}<span className="text"><i className="fa-regular fa-chevrons-right"></i>{cat.name}</span>{' '}<span>({cat.articleCount ?? 0})</span>{' '}</a>
                      </li>
                    
</Fragment>
))}
                  </ul>
                </div>
              </div>
            
</>
) : null}{' '}{(recent.length > 0) ? (
<>

              <div className="main-sidebar2-widget">
                <div className="main-sidebar2-widget__heading wow fadeInUp" data-wow-delay=".3s">
                  <div className="main-sidebar2-widget__heading-title">{t('blog.sidebar.recent')}</div>
                </div>
                <div className="main-sidebar2-widget__post">
                  {(recent).map((rec, i5) => (
<Fragment key={i5}>

                    <div className="main-sidebar2-widget__post-items wow fadeInUp" data-wow-delay=".4s">
                      <div className="main-sidebar2-widget__post-items-thumb">
                        <img src={rec.featuredImage ?? asset('build/images/inner/blog-details/blog-details1_1.png')} alt={`${rec.title} - blog Alivaon Cameroun`} />
                      </div>
                      <div className="main-sidebar2-widget__post-items-content">
                        <ul className="main-sidebar2-widget__post-items-content-post">
                          <li className="main-sidebar2-widget__post-items-content-post-date">
                            {twigDate(rec.publishedAt, 'd M Y')}
                          </li>
                        </ul>
                        <div className="main-sidebar2-widget__post-items-content-title">
                          <a href={path(locale, 'app_blog_show', { slug: rec.slug })}>{rec.title}</a>
                        </div>
                      </div>
                    </div>
                  
</Fragment>
))}
                </div>
              </div>
            
</>
) : null}{' '}{(tags.length > 0) ? (
<>

              <div className="main-sidebar2-widget wow fadeInUp" data-wow-delay=".9s">
                <div className="main-sidebar2-widget__heading">
                  <div className="main-sidebar2-widget__heading-title">{t('blog.sidebar.tags')}</div>
                </div>
                <div className="main-sidebar2-widget__tags">
                  <div className="main-sidebar2-widget__tags-tagcloud">
                    {(tags).map((tag, i6) => (
<Fragment key={i6}>{' '}<a href={path(locale, 'app_blog_by_tag', { slug: tag.slug })}>{tag.name}</a>{' '}</Fragment>
))}
                  </div>
                </div>
              </div>
            
</>
) : null}

          </div>
        </div>
      </div>

    </div>
  </div>

</main>
    </PageShell>
  );
}
