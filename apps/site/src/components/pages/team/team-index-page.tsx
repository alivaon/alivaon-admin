import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members as membersOf } from '@/lib/api';
import { asset } from '@/lib/config';
import { socialLinks, staticAlternates } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** team/index.html.twig (premier membre mis en avant, les autres en grille). */
export async function TeamIndexPage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const members = membersOf(await load(api.GET('/api/public/{locale}/team-members', { params: { path: { locale } }, fetch: cached('team-members') })));
  const featured = members[0] ?? null;
  // La liste ne porte pas la biographie : citation du membre mis en avant lue sur sa fiche.
  const featuredBio = featured
    ? (await load(api.GET('/api/public/{locale}/team-members/{slug}', { params: { path: { locale, slug: featured.slug } }, fetch: cached('team-members') }))).bio
    : null;

  return (
    <PageShell
      page={{ locale, route: 'app_team_index', alternates: staticAlternates('app_team_index') }}
      seo={{
        pathname: path(locale, 'app_team_index'),
        title: t('team.index.title'),
        description: t('team.index.meta_description'),
        ogTitle: t('team.index.og_title'),
        ogDescription: t('team.index.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Alivaon',
              description: t('team.index.jsonld_description'),
              address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
              telephone: '+237691962158',
              email: 'contact@alivaon.com',
              areaServed: ['Douala', 'Yaoundé', 'Cameroun'],
              numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 50 },
            }}
          />
        ),
      }}
    >
      <div className="breadcrumb1 section-bg overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb1__top">
        <div className="breadcrumb1__top-left">{t('team.index.breadcrumb')}</div>
        <div className="breadcrumb1__top-right">
          <div className="breadcrumb1__top-right-img">
            <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt={t('team.img_alt1')} />
          </div>
          <div className="breadcrumb1__top-right-text">{t('team.index.tagline')}</div>
        </div>
      </div>
      <h1 className="breadcrumb1__title">{t('team.index.h1')}</h1>
    </div>
    <div className="breadcrumb1__thumb">
      <img src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt={t('team.img_alt2')} />
    </div>
  </div>

  
  <section className="team-page section-spacing section-bg overflow-hidden pt-0" aria-label={t('team.index.leadership')}>
    <h2 className="team-page__title">{t('team.index.section')}</h2>
    <div className="container">
      {null}
      <div className="row g-4 justify-content-between">
        <div className="col-xl-3 col-lg-3 col-md-6">
          <div className="team-page__card">
            <h3 className="team-page__card-title">{t('team.index.leadership')}</h3>
          </div>
        </div>
        <div className="col-xl-5 col-lg-5 col-md-6">
          <div className="team-page__card">
            <div className="team-page__card-thumb">
              {(featured) ? (
<>

                <img src={featured!.photo ?? asset('build/images/inner/team/team-thumb1_1.jpg')} alt={`${featured!.fullName} - ${featured!.position} chez Alivaon Douala`} />
              
</>
) : null}
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-4 col-md-6">
          <div className="team-page__card">
            <div className="team-page__card-content">
              {(featured) ? (
<>

                <h3 className="team-page__card-content-title">{featuredBio ? `"${featuredBio}"` : `"${t('team.index.featured_quote_fallback')}"`}</h3>
                <div className="team-page__card-content-name">{featured!.fullName}</div>
                <p className="team-page__card-content-dsc">{featured!.position}</p>
                <ul className="team-page__card-content-list">
                  {(socialLinks(featured!.socialLinks).length > 0) ? (
<>

                    {(socialLinks(featured!.socialLinks)).map(([network, url], i0) => (
<Fragment key={i0}>

                      <li className="team-page__card-content-list-items"><a href={url} aria-label={`${featured!.fullName} sur ${network}`}>{network.toUpperCase()}</a></li>
                    
</Fragment>
))}
                  
</>
) : (
<>

                    <li className="team-page__card-content-list-items">LINKEDIN</li>
                  
</>
)}
                </ul>
              
</>
) : (
<>

                <h3 className="team-page__card-content-title">&quot;{t('team.index.no_member_quote')}&quot;</h3>
              
</>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section className="team-section section-spacing section-bg overflow-hidden pt-0" aria-label={t('team.index.members_aria')}>
    <div className="container">
      <div className="row g-4 d-flex justify-content-between">
        {(members.slice(1)).length > 0 ? (members.slice(1)).map((member, i1) => (
<Fragment key={i1}>

          <div className="col-xl-4 col-lg-4 col-md-6">
            <div className="team-section__card">
              <div className="team-section__card-thumb rr-ov-hidden">
                <img data-speed="0.9" src={member.photo ?? asset('build/images/inner/team/team-thumb1_2.jpg')} alt={`${member.fullName} - ${member.position} chez Alivaon Douala`} />
              </div>
              <div className="team-section__card-items">
                <ul className="team-section__card-items-list">
                  {(socialLinks(member.socialLinks).length > 0) ? (
<>

                    {(socialLinks(member.socialLinks)).map(([network, url], i2) => (
<Fragment key={i2}>

                      <li><a href={url} aria-label={`${member.fullName} sur ${network}`}>{network.toUpperCase()}</a></li>
                    
</Fragment>
))}
                  
</>
) : (
<>

                    <li>LINKEDIN</li>
                  
</>
)}
                </ul>
              </div>
              <div className="team-section__card-content">
                <h3 className="team-section__card-content-title">
                  <a href={path(locale, 'app_team_show', { slug: member.slug })} className="team-section__card-content-title-name">{member.fullName}</a>
                </h3>
                <p className="team-section__card-content-subtitle">{member.position}</p>
              </div>
            </div>
          </div>
        
</Fragment>
)) : (
<>

          <div className="col-12 text-center py-5">
            <p>{t('team.index.empty')}</p>
          </div>
        
</>
)}
      </div>
    </div>
  </section>

  
  <div className="team-vision overflow-hidden bg-img" style={{ backgroundImage: `url(${asset('build/images/inner/team/team-vision-bg.png')})` }}>
    <div className="container rr-container-1800">
      <div className="row g-4 d-flex justify-content-start align-items-end">
        <div className="col-xl-4">
          <div className="team-vision__title">{t('team.index.value1')}</div>
        </div>
        <div className="col-xl-5">
          <div className="team-vision__content">
            <div className="team-vision__item">
              <div className="team-vision__item-title">{t('team.index.value2')}</div>
              <p className="team-vision__item-text">{t('team.index.vision1')}</p>
            </div>
            <div className="team-vision__item">
              <div className="team-vision__item-title">{t('team.index.value3')}</div>
              <p className="team-vision__item-text">{t('team.index.vision2')}</p>
            </div>
            <div className="team-vision__item">
              <p className="team-vision__item-text text-white">{t('team.index.vision3')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="team-vision__thumb">
    <div className="container rr-container-1800">
      <div className="row">
        <div className="team-vision__thumb-img">
          <img src={asset('build/images/inner/team/team-vision-thumb1_1.jpg')} alt={t('team.img_alt3')} />
        </div>
      </div>
    </div>
  </div>

  
  <div className="team-achievement section-bg section-spacing rr-ov-hidden">
    <div className="container rr-container-1800">
      <div className="row g-4 d-flex justify-content-center">
        <div className="col-xl-5 col-lg-5 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="30">30</span>+</div>
            <p className="team-achievement__card-text">{t('team.index.kpi1')}</p>
          </div>
        </div>
        <div className="col-xl-7 col-lg-7 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="50">50</span>+</div>
            <p className="team-achievement__card-text">{t('team.index.kpi2')}</p>
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
            <p className="team-achievement__card-text">{t('about.awards.a5_topic')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="text-center section-spacing">
    <p style={{ marginBottom: '1rem' }}>{t('team.cta_text')}</p>
    <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('team.contact_aria')}>{' '}{t('team.cta_button')}{' '}</a>
  </div>
    </PageShell>
  );
}
