import { Fragment } from 'react';
import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load } from '@/lib/api';
import { absoluteUrl, asset } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { sliceChars, stripTags, twigEscape, urlEncode } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { applicationScript } from './careers-show-script';

/** carriere/show.html.twig (offre expirée ou non publiée : 404 de l'API). */
export async function CareersShowPage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = translator(locale);
  const offer = await load(api.GET('/api/public/{locale}/job-offers/{slug}', { params: { path: { locale, slug } }, fetch: cached('job-offers') }));
  const absoluteOfferUrl = absoluteUrl(path(locale, 'app_carriere_show', { slug: offer.slug }));
  const offerUrl = urlEncode(absoluteOfferUrl);
  const offerTitle = urlEncode(offer.title);
  const contract = t(`contract.${offer.contractType}`);
  const plainDescription = stripTags(offer.description);
  const coverName = offer.coverImage ?? 'x.jpg';

  return (
    <PageShell
      page={{ locale, route: 'app_carriere_show', alternates: offer.alternates }}
      pageScripts={[{ inline: applicationScript(locale, slug) }]}
      seo={{
        pathname: path(locale, 'app_carriere_show', { slug }),
        // « à » écrit en dur dans le gabarit, y compris en anglais.
        title: `${offer.title} - ${contract} ${offer.location ? `à ${offer.location}` : ''} | Alivaon`,
        description: offer.shortDescription ? offer.shortDescription : sliceChars(plainDescription, 0, 160),
        ogType: 'article',
        ogTitle: `${offer.title} | ${t('carriere.show.og_suffix')}`,
        ogDescription: offer.shortDescription ? offer.shortDescription : sliceChars(plainDescription, 0, 200),
        ogImage: absoluteUrl(offer.coverImage ?? asset('build/images/og/og-default.png')),
        ogImageType: coverName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        ogImageAlt: `${offer.title} - ${t('carriere.show.og_image_alt')}`,
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: offer.title,
              description: plainDescription,
              datePosted: twigDate(offer.publishedAt ?? offer.createdAt, 'Y-m-d'),
              ...(offer.expiresAt ? { validThrough: twigDate(offer.expiresAt, 'Y-m-d') } : {}),
              employmentType: offer.contractType.toUpperCase().replace(/ /g, '_').replace(/É/g, 'E').replace(/Ô/g, 'O'),
              hiringOrganization: { '@type': 'Organization', name: 'Alivaon', sameAs: 'https://www.alivaon.com', logo: absoluteUrl(asset('build/images/logo/logo.png')) },
              jobLocation: {
                '@type': 'Place',
                address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: offer.location || 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
              },
              ...(offer.salary
                ? { baseSalary: { '@type': 'MonetaryAmount', currency: 'XAF', value: { '@type': 'QuantitativeValue', description: offer.salary } } }
                : {}),
              skills: offer.skills && offer.skills.length > 0 ? offer.skills.join(', ') : '',
              // Sans json_encode dans le gabarit : échappement HTML de Twig.
              url: twigEscape(absoluteOfferUrl),
            }}
          />
        ),
      }}
    >
      <div className="breadcrumb2 overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb2-content">
        <span className="breadcrumb2-content__subtitle">{' '}<a href={path(locale, 'app_carriere_index')} style={{ textDecoration: 'none', opacity: '.7' }}>{t('nav.careers')}</a>{' '}&nbsp;/&nbsp; {t(`contract.${offer.contractType}`)}{' '}</span>
        <h1 className="breadcrumb2-content__title">{offer.title}</h1>
        {(offer.location || offer.salary) ? (
<>

          <p className="breadcrumb2-content__heading">
            {(offer.location) ? (
<>
<i className="fa-solid fa-location-dot me-1"></i>{offer.location}
</>
) : null}{' '}{(offer.location && offer.salary) ? (
<>
 &nbsp;·&nbsp; 
</>
) : null}{' '}{(offer.salary) ? (
<>
<i className="fa-solid fa-wallet me-1"></i>{offer.salary}
</>
) : null}
          </p>
        
</>
) : null}
      </div>
    </div>
  </div>

  
  <div className="contact-area__info-row">
    <div className="container">
      <div className="row gy-3">
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('carriere.contract_type')}</h2>
            <p className="contact-info-card__text">{offer.contractType}</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('carriere.location')}</h2>
            <p className="contact-info-card__text">{offer.location || 'Douala, Cameroun'}</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('carriere.show.salary')}</h2>
            <p className="contact-info-card__text">{offer.salary || 'À définir selon profil'}</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('carriere.show.deadline')}</h2>
            <p className="contact-info-card__text">
              {offer.expiresAt ? twigDate(offer.expiresAt, 'd/m/Y') : 'Pas de date limite'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <section className="section-bg section-spacing rr-ov-hidden" aria-label={`Description du poste ${offer.title}`}>
    <div className="container rr-container-1600">
      <div className="row g-5">

        
        <div className="col-xl-8 col-lg-7 wow fadeInLeft" data-wow-delay=".3s">
          <div className="faq1__top-section">
            <div className="faq1__top-section-title">{t('carriere.show.job_description')}</div>
          </div>
          <div className="service-details__card mt-4" style={{ lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: offer.description }} />

          {(offer.skills && offer.skills.length > 0) ? (
<>

            <div className="faq1__top-section mt-5">
              <div className="faq1__top-section-title">{t('carriere.show.skills')}</div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              {(offer.skills ?? []).map((skill, i0) => (
<Fragment key={i0}>{' '}<span className="badge rounded-pill py-2 px-4 fs-6 fw-normal" style={{ background: 'rgba(54,169,225,0.12)', color: '#101010', border: '1px solid rgba(54,169,225,0.35)' }}>{' '}{skill}{' '}</span>{' '}</Fragment>
))}
            </div>
          
</>
) : null}
        </div>

        
        <div className="col-xl-4 col-lg-5 wow fadeInRight" data-wow-delay=".5s">
          <div className="service-details__card">
            <h2 className="service-details__card-title">{t('carriere.show.summary')}</h2>
            <div className="service-details__card-subtitle">
              <p><strong>{t('carriere.show.published_on')}</strong> {twigDate(offer.publishedAt ?? offer.createdAt, 'd/m/Y')}</p>
              {(offer.expiresAt) ? (
<>
<p><strong>{t('carriere.show.expires_on')}</strong> {twigDate(offer.expiresAt, 'd/m/Y')}</p>
</>
) : null}
              <p><strong>{t('carriere.show.contract_label')}</strong> {offer.contractType}</p>
              <p><strong>{t('carriere.show.location_label')}</strong> {offer.location || 'Douala, Cameroun'}</p>
              {(offer.salary) ? (
<>
<p><strong>{t('carriere.show.salary_label')}</strong> {offer.salary}</p>
</>
) : null}
            </div>

            <div className="mt-4">
              <a href="#candidature" className="btn btn-info w-100 mb-2" aria-label={t('carriere.show.apply_for', { '%title%': offer.title })}>{' '}<i className="fa-solid fa-paper-plane me-2"></i> {t('carriere.show.apply_now')}{' '}</a>{' '}{null}{' '}{null}
              <div className="d-flex gap-2">
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${offerUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary flex-fill" aria-label={t('blog.show.share_on', {'%network%': 'LinkedIn'})}>{' '}<i className="fa-brands fa-linkedin-in"></i>{' '}</a>{' '}<a href={`https://www.facebook.com/sharer/sharer.php?u=${offerUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary flex-fill" aria-label={t('blog.show.share_on', {'%network%': 'Facebook'})}>{' '}<i className="fa-brands fa-facebook-f"></i>{' '}</a>{' '}<a href={`https://x.com/intent/tweet?url=${offerUrl}&text=${offerTitle}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary flex-fill" aria-label={t('blog.show.share_on', {'%network%': 'X'})}>{' '}<i className="fa-brands fa-x-twitter"></i>{' '}</a>{' '}<a href={`https://wa.me/?text=${urlEncode(`${offer.title} ${absoluteOfferUrl}`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary flex-fill" aria-label={t('blog.show.share_on', {'%network%': 'WhatsApp'})}>{' '}<i className="fa-brands fa-whatsapp"></i>{' '}</a>
              </div>
            </div>
          </div>

          <div className="service-details__card mt-4">
            <h2 className="service-details__card-title">{t('footer.about_title')}</h2>
            <p className="service-details__card-subtitle">
              {t('carriere.show.about_alivaon')}
            </p>
            <a href={path(locale, 'app_about')} style={{ color: '#36A9E1', fontSize: '.9rem' }}>{t('carriere.show.learn_more')}</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  
  <section className="contact-area" id="candidature" aria-labelledby="candidature-heading">
    <div className="container">

      <div className="row">
        <div className="col-12">
          <h2 className="contact-area__heading" id="candidature-heading">
            {t('carriere.show.apply_for', { '%title%': offer.title })}
          </h2>
        </div>
      </div>

      
      

      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-11">
          <div className="contact-form-card" id="candidature-form-card">

            <form name="candidate_application" method="post" action={`/api/public/${locale}/job-offers/${encodeURIComponent(slug)}/applications`} className="contact-form" id="candidature-form" noValidate encType="multipart/form-data">
            <div className="row g-3 contact-form__top">
              <div className="col-md-6">
                <input type="text" id="candidate_application_firstName" name="firstName" required className="contact-form__input" placeholder="Prénom *" />
              </div>
              <div className="col-md-6">
                <input type="text" id="candidate_application_lastName" name="lastName" required className="contact-form__input" placeholder="Nom *" />
              </div>
              <div className="col-md-6">
                <input type="email" id="candidate_application_email" name="email" required className="contact-form__input" placeholder="Email *" />
              </div>
              <div className="col-md-6">
                <input type="tel" id="candidate_application_phone" name="phone" className="contact-form__input" placeholder="Téléphone" />
              </div>
              <div className="col-md-6">
                <input type="text" id="candidate_application_city" name="city" className="contact-form__input" placeholder="Ville" />
              </div>
              <div className="col-md-6">
                <input type="text" id="candidate_application_country" name="country" className="contact-form__input" placeholder="Pays" />
              </div>
              <div className="col-md-6">
                <input type="text" id="candidate_application_linkedinUrl" name="linkedinUrl" className="contact-form__input" placeholder="Profil LinkedIn (optionnel)" inputMode="url" />
              </div>
              <div className="col-md-6">
                <input type="text" id="candidate_application_portfolioUrl" name="portfolioUrl" className="contact-form__input" placeholder="Portfolio / GitHub (optionnel)" inputMode="url" />
              </div>
            </div>
            <div className="contact-form__middle">
              <textarea id="candidate_application_motivation" name="motivation" required className="contact-form__textarea" rows={6} placeholder="Lettre de motivation * (min. 50 caractères)"></textarea>
            </div>
            <div className="mt-3">
              <div className="cv-upload">
                <label className="cv-upload__zone" htmlFor="candidate_application_cvFile" aria-label={t('carriere.show.select_cv_aria')}>{' '}<span className="cv-upload__icon">{' '}<i className="fa-solid fa-file-arrow-up"></i>{' '}</span>{' '}<span className="cv-upload__label-text">{' '}<strong id="cv-filename">{t('carriere.show.choose_cv')}</strong><br />
                    {t('carriere.show.cv_constraints')}{' '}</span>{' '}</label>{' '}<input type="file" id="candidate_application_cvFile" name="cvFile" required accept=".pdf,.doc,.docx" className="contact-form__file-input" aria-describedby="cv-hint" />
                <p className="cv-upload__hint" id="cv-hint">{t('carriere.show.cv_formats')}</p>
              </div>
            </div>
            <input type="text" id="candidate_application_honeypot" name="honeypot" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <div className="contact-form__footer">
              <button type="submit" className="btn contact-form__send" id="candidature-submit" aria-label={t('carriere.show.submit_aria')}>{' '}<span className="contact-form__send-text">{' '}<i className="fa-solid fa-paper-plane me-2"></i> {t('carriere.show.submit')}{' '}</span>{' '}</button>
            </div>
          </form>

          </div>
        </div>
      </div>

    </div>

    <div className="contact-area__bg bg-img" style={{ backgroundImage: `url(${asset('build/images/inner/contact/contact-bg.jpg')})` }} aria-hidden="true"></div>
  </section>

  
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-xl-10 col-lg-11">
        <p className="contact-area__reassurance text-center">
          <i className="fa-solid fa-lock me-1"></i><strong>{t('carriere.show.confidential')}</strong> &bull;{' '}<i className="fa-regular fa-clock me-1"></i>{t('carriere.show.reply_within')} <strong>{t('carriere.show.48h')}</strong> &bull;{' '}<i className="fa-solid fa-shield-check me-1"></i>{t('carriere.show.secure_cv')} &bull;{' '}<a href={path(locale, 'app_carriere_index')} style={{ color: '#36A9E1' }}>{t('carriere.show.back_to_offers')}</a>
        </p>
      </div>
    </div>
  </div>
    </PageShell>
  );
}
