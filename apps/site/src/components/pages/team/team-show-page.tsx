import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { sliceChars, stripTags, twigEscape } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** team/show.html.twig */
export async function TeamShowPage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = translator(locale);
  const member = await load(api.GET('/api/public/{locale}/team-members/{slug}', { params: { path: { locale, slug } }, fetch: cached('team-members') }));
  const links = (member.socialLinks ?? {}) as Record<string, string>;
  const photoName = member.photo ?? 'x.jpg';
  // bio|default(…)|striptags|slice(0, 155) : default remplace aussi la chaîne vide.
  const description = sliceChars(stripTags(member.bio || `${member.fullName}, ${member.position} ${t('team.show.meta_suffix')}`), 0, 155);

  return (
    <PageShell
      page={{ locale, route: 'app_team_show', alternates: member.alternates }}
      seo={{
        pathname: path(locale, 'app_team_show', { slug }),
        title: `${member.fullName} - ${member.position} | ${t('team.show.title_suffix')}`,
        description,
        ogTitle: `${member.fullName} - ${member.position} | Alivaon Douala`,
        ogDescription: t('team.show.og_description', { '%name%': member.fullName, '%position%': member.position }),
        ogType: 'profile',
        ogImage: absoluteUrl(member.photo ?? asset('build/images/inner/team-details/team-details-thumb1_1.jpg')),
        ogImageType: photoName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        ogImageAlt: `${member.fullName} - ${member.position} ${t('team.show.at_alivaon')}`,
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'Person',
              // Sans json_encode dans le gabarit : échappement HTML de Twig.
              name: twigEscape(member.fullName),
              jobTitle: twigEscape(member.position),
              worksFor: {
                '@type': 'LocalBusiness',
                name: 'Alivaon',
                address: { '@type': 'PostalAddress', addressLocality: 'Douala', addressCountry: 'CM' },
                telephone: '+237691962158',
              },
              ...(member.email ? { email: twigEscape(member.email) } : {}),
            }}
          />
        ),
      }}
    >
      <section className="team-details section-bg rr-ov-hidden">
  <h1 className="team-details__title">{member.fullName}</h1>
  <div className="container rr-container-1600">
    <div className="row">
      <div className="col-xl-12">
        <div className="team-details__items">
          <div className="team-details__items-thumb">
            <img src={member.photo ?? asset('build/images/inner/team-details/team-details-thumb1_1.jpg')} alt={`${member.fullName} - ${member.position} ${t('team.show.at_alivaon_full')}`} />
          </div>
          <div className="team-details__items-bottom">
            {(Object.keys(links).length > 0) ? (
<>

            <div className="team-details__items-social">
              <p className="team-details__items-social-subtitle">{t('team.show.social')}</p>
              <div className="team-details__items-social-link">
                {('facebook' in links) ? (
<>
<a href={links.facebook} aria-label={`${member.fullName} sur Facebook`}><span><i className="fa-brands fa-facebook-f"></i></span></a>
</>
) : null}{' '}{('twitter' in links) ? (
<>
<a href={links.twitter} aria-label={`${member.fullName} sur Twitter`}><span><i className="fa-brands fa-twitter"></i></span></a>
</>
) : null}{' '}{('linkedin' in links) ? (
<>
<a href={links.linkedin} aria-label={`${member.fullName} sur LinkedIn`}><span><i className="fa-brands fa-linkedin-in"></i></span></a>
</>
) : null}{' '}{('instagram' in links) ? (
<>
<a href={links.instagram} aria-label={`${member.fullName} sur Instagram`}><span><i className="fa-brands fa-instagram"></i></span></a>
</>
) : null}{' '}{('github' in links) ? (
<>
<a href={links.github} aria-label={`${member.fullName} sur GitHub`}><span><i className="fa-brands fa-github"></i></span></a>
</>
) : null}
              </div>
            </div>
            
</>
) : null}
            <div className="team-details__items-role">
              <p className="team-details__items-role-subtitle">{t('team.show.role')}</p>
              <p className="team-details__items-role-title">{member.position}</p>
            </div>
            {(member.email) ? (
<>

            <div className="team-details__items-exp">
              <p className="team-details__items-exp-subtitle">{t('team.show.email')}</p>
              <p className="team-details__items-exp-title"><a href={`mailto:${member.email}`}>{member.email}</a></p>
            </div>
            
</>
) : null}
          </div>
          <div className="team-details__items-content">
            {(member.bio) ? (
<>

              <p className="team-details__items-content-subtitle">{member.bio}</p>
              {(member.bio2) ? (
<>

                <p className="team-details__items-content-subtitle2">{member.bio2}</p>
              
</>
) : null}{' '}{(member.bio3) ? (
<>

                <p className="team-details__items-content-subtitle3">{member.bio3}</p>
              
</>
) : null}
            
</>
) : (
<>

              <p className="team-details__items-content-subtitle">{t('team.show.bio_fallback1', {'%name%': member.fullName})}</p>
              <p className="team-details__items-content-subtitle2">{t('team.show.bio_fallback2')}</p>
              <p className="team-details__items-content-subtitle3">{t('team.show.bio_fallback3')}</p>
            
</>
)}
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="container rr-container-1600">
    <div className="text-center" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <p style={{ marginBottom: '1rem' }}>{t('team.cta_text')}</p>
      <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('team.show.contact_aria')}>{' '}{t('blog.show.cta_button')}{' '}</a>
    </div>
  </div>
</section>
    </PageShell>
  );
}
