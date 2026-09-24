import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { asset, SITE_ORIGIN } from '@/lib/config';
import { staticAlternates, strcasecmp } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';
import { CONTACT_SCRIPT } from './contact-script';

/** contact/index.html.twig */
export async function ContactPage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  // Suggestions du champ « sujet » : titres des services actifs, tri strcasecmp (contrôleur).
  const services = members(await load(api.GET('/api/public/{locale}/services', { params: { path: { locale } }, fetch: cached('services') })));
  const subjects = services.map((service) => service.title).sort(strcasecmp);

  return (
    <PageShell
      page={{ locale, route: 'app_contact', alternates: staticAlternates('app_contact') }}
      pageScripts={[{ inline: CONTACT_SCRIPT }]}
      seo={{
        pathname: path(locale, 'app_contact'),
        title: t('contact.title'),
        description: t('contact.meta_description'),
        ogTitle: t('contact.og_title'),
        ogDescription: t('contact.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Alivaon',
              description: t('contact.jsonld_description'),
              url: SITE_ORIGIN,
              telephone: '+237691962158',
              email: 'contact@alivaon.com',
              address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '18:00',
              },
              geo: { '@type': 'GeoCoordinates', latitude: 4.0511, longitude: 9.7185 },
              areaServed: ['Douala', 'Yaoundé', 'Cameroun'],
              serviceType: ['Développement logiciel', 'Application web', 'Application mobile', 'Logiciel de gestion', 'Digitalisation entreprise'],
            }}
          />
        ),
      }}
    >
      <main>

  
  <div className="breadcrumb2 overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb2-content">
        <span className="breadcrumb2-content__subtitle">{t('side.contact_us')}</span>
        <h1 className="breadcrumb2-content__title">{t('contact.h1')}</h1>
        <p className="breadcrumb2-content__heading">{t('contact.heading')}</p>
      </div>
    </div>
  </div>

  
  <div className="contact-area__info-row">
    <div className="container">
      <div className="row gy-3">
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('contact.card.address')}</h2>
            <p className="contact-info-card__text">Logpom, Douala, Cameroun</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('contact.card.phone_email')}</h2>
            <p className="contact-info-card__text"> contact@alivaon.com <br /> / +237 6 91 96 21 58 / +33 6 99 11 28 35</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('contact.card.hours')}</h2>
            <p className="contact-info-card__text">{t('contact.card.hours_value')} <br /> 09h00 - 18h00</p>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="contact-info-card">
            <h2 className="contact-info-card__title">{t('contact.card.follow')}</h2>
            <div className="contact-info-card__social">
              <a href="https://www.facebook.com/alivaon" className="social-circle" aria-label="Facebook Alivaon">f</a>
              <a href="https://x.com/alivaon" className="social-circle" aria-label="Twitter Alivaon">x</a>
              <a href="https://www.linkedin.com/company/alivaon/" className="social-circle" aria-label="LinkedIn Alivaon">in</a>
              <a href="https://www.tiktok.com/@alivaon.io" className="social-circle" aria-label="Tiktok Alivaon">&#9658;</a>
              <a href="https://www.instagram.com/alivaon.io/" className="social-circle" aria-label="Instagram Alivaon">&#x1F4F7;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <section className="contact-area" aria-labelledby="contact-form-heading">
    <div className="container">

      <div className="row">
        <div className="col-12">
          <h2 className="contact-area__heading" id="contact-form-heading">
            {t('contact.form.heading')}
          </h2>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-11">
          <div className="contact-form-card" id="contact-form-card">

            <form name="contact" method="post" action={`/api/public/${locale}/contact-messages`} className="contact-form" noValidate id="contact-form">
              <div className="row g-3 contact-form__top">
                <div className="col-md-4">
                  <input type="text" id="contact_name" name="name" required placeholder={t('contact.form.name_placeholder')} className="contact-form__input" aria-label={t('contact.form.name_aria')} />
                </div>
                <div className="col-md-4">
                  <input type="email" id="contact_email" name="email" required placeholder={t('contact.form.email_placeholder')} className="contact-form__input" aria-label={t('contact.form.email_aria')} />
                </div>
                <div className="col-md-4">
                  <input type="tel" id="contact_phone" name="phone" placeholder={t('contact.form.phone_placeholder')} className="contact-form__input" aria-label={t('contact.form.phone_aria')} />
                </div>
                <div className="col-12">
                  <div className="subject-autocomplete">
                    <input
                      type="text"
                      id="contact_subject"
                      name="subject"
                      placeholder={t('contact.form.subject_placeholder')}
                      className="contact-form__input subject-autocomplete__input"
                      list="service-suggestions"
                      autoComplete="off"
                      aria-label={t('contact.form.subject_aria')}
                    />
                    <ul className="subject-autocomplete__list" role="listbox" aria-label={t('contact.form.subject_suggestions')}>
                      {subjects.map((title, index) => (
                        <li key={index} className="subject-autocomplete__item" role="option" tabIndex={-1}>
                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="contact-form__middle">
                <textarea id="contact_message" name="message" required placeholder={t('contact.form.message_placeholder')} rows={4} className="contact-form__textarea" aria-label={t('contact.form.message_aria')}></textarea>
              </div>
              <div className="contact-form__footer">
                <button type="submit" className="btn contact-form__send" aria-label={t('contact.form.send_aria')}>
                  <span className="contact-form__send-text">{t('common.send')}</span>
                </button>
              </div>
              <div>
                <input type="text" id="contact_honeypot" name="honeypot" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
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
        <p className="contact-area__reassurance text-center" dangerouslySetInnerHTML={{ __html: t('contact.reassurance') }} />
      </div>
    </div>
  </div>

  
  <div className="map">
    <div className="map-box">
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.673056454061!2d9.763020775866607!3d4.086813446671635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10610d10a8fbb0f9%3A0x75449a7b7b2fb1cf!2sAlivaon!5e0!3m2!1sfr!2sfr!4v1777782397819!5m2!1sfr!2sfr" width="600" height="450" style={{ border: '0' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>

</main>
    </PageShell>
  );
}
