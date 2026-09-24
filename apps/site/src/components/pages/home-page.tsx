import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { absoluteUrl, asset, SITE_ORIGIN } from '@/lib/config';
import { twigDate } from '@/lib/dates';
import { staticAlternates } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** {% set pricing_icon %} de home/index.html.twig */
function PricingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.4341 0.15781C11.641 0.295733 11.7846 0.510175 11.8333 0.753967C11.8821 0.99776 11.832 1.25094 11.6941 1.45781L5.44411 10.8328C5.36714 10.9481 5.26554 11.0449 5.14665 11.1162C5.02776 11.1875 4.89454 11.2316 4.75657 11.2452C4.6186 11.2589 4.47933 11.2417 4.34878 11.195C4.21824 11.1484 4.09967 11.0733 4.00161 10.9753L0.251615 7.22531C0.0860148 7.04759 -0.00413921 6.81253 0.000146059 6.56966C0.00443133 6.32678 0.102821 6.09505 0.274588 5.92328C0.446354 5.75152 0.678085 5.65313 0.920961 5.64884C1.16384 5.64456 1.3989 5.73471 1.57661 5.90031L4.51786 8.84156L10.1341 0.41656C10.2722 0.209907 10.4868 0.0665612 10.7305 0.0180398C10.9743 -0.0304816 11.2274 0.0197929 11.4341 0.15781Z" fill="white" />
                    </svg>
  );
}

/** Script de la page (bloc page_scripts) : en-tête compacté au défilement. */
const HOME_SCRIPT = `(function () {
  var header = document.querySelector('.header-area-7');
  if (!header || typeof ScrollTrigger === 'undefined') return;
  ScrollTrigger.create({
    start: 'top -30',
    onEnter: function () { header.classList.add('is-scrolled'); },
    onLeaveBack: function () { header.classList.remove('is-scrolled'); },
  });
})();`;

/** home/index.html.twig */
export async function HomePage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const [posts, services, testimonials] = await Promise.all([
    load(api.GET('/api/public/{locale}/articles', { params: { path: { locale }, query: { itemsPerPage: 4 } }, fetch: cached('articles') })).then(members),
    load(api.GET('/api/public/{locale}/services', { params: { path: { locale }, query: { homepage: true } }, fetch: cached('services') })).then(members),
    load(api.GET('/api/public/{locale}/testimonials', { params: { path: { locale }, query: { featured: true } }, fetch: cached('testimonials') })).then(members),
  ]);

  return (
    <PageShell
      page={{ locale, route: 'app_home', alternates: staticAlternates('app_home') }}
      headerClass="header-area-7"
      pageScripts={[{ inline: HOME_SCRIPT }]}
      seo={{
        pathname: path(locale, 'app_home'),
        title: t('home.title'),
        description: t('home.meta_description'),
        ogTitle: t('home.og_title'),
        ogDescription: t('home.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'Alivaon',
                  url: SITE_ORIGIN,
                  description: t('home.jsonld_website'),
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: `${SITE_ORIGIN}/blog?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  name: 'Alivaon',
                  url: SITE_ORIGIN,
                  logo: absoluteUrl(asset('build/images/logo/logo.png')),
                  description: t('home.jsonld_org'),
                  telephone: '+237691962158',
                  email: 'contact@alivaon.com',
                  address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
                  areaServed: ['Douala', 'Yaoundé', 'Cameroun', 'Afrique centrale'],
                  serviceType: [
                    'Logiciel de gestion sur mesure',
                    'Application mobile Android',
                    'Création application web',
                    'Logiciel de facturation',
                    'Solution de gestion des stocks',
                    'Digitalisation PME Cameroun',
                  ],
                  sameAs: ['https://www.linkedin.com/company/alivaon', 'https://www.facebook.com/alivaon'],
                },
              ],
            }}
          />
        ),
      }}
    >
      <div className="intro-area4 section-spacing overflow-hidden" style={{ backgroundImage: `url('${asset('build/images/home-4/intro/introbg-thumb1_1.jpg')}')` }}>
    <div className="container rr-container-1800">
      <div className="row g-60 justify-content-between">
        <div className="col-xl-6 col-lg-6">
          <div className="intro-area4__content">
            <div className="intro-area4__content-subtitle wow fadeInUp" data-wow-delay=".3s">{t('home.hero.subtitle')}</div>
            <h1 className="intro-area4__content-title wow fadeInUp" data-wow-delay=".5s">{t('home.hero.title')}</h1>
            <div className="intro-area4__content-items">
              <div className="intro-area4__content-items-image">
                <img src={asset('build/images/home-4/intro/mentro-image1_1.png')} alt="Alivaon - agence digitale développement logiciel Douala Cameroun" />
              </div>
              <p className="intro-area4__content-items-text wow fadeInUp" data-wow-delay=".7s" dangerouslySetInnerHTML={{ __html: t('home.hero.text') }} />
            </div>
            <div className="intro-area4__content-newsletter">
              <form action={path(locale, 'app_contact')} className="intro-area4__content-newsletter-box">
                <input type="email" name="email" id="email" placeholder={t('home.hero.input_placeholder')} />{' '}<button className="intro-area4__content-newsletter-button">{' '}<span className="intro-area4__content-newsletter-button-icon" title={t('home.hero.demo_title')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="26" viewBox="0 0 44 26" fill="none" aria-hidden="true">
                      <path d="M29.3333 0C29.3333 1.36033 30.6772 3.39167 32.0375 5.09667C33.7865 7.29667 35.8765 9.21617 38.2727 10.681C40.0693 11.7792 42.2473 12.8333 44 12.8333M44 12.8333C42.2473 12.8333 40.0675 13.8875 38.2727 14.9857C35.8765 16.4523 33.7865 18.3718 32.0375 20.5682C30.6772 22.275 29.3333 24.31 29.3333 25.6667M44 12.8333H0" stroke="black" strokeWidth="2" />
                    </svg>
                  </span>{' '}</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-xl-6 col-lg-6 wow fadeInUp" data-wow-delay=".3s">
          <div className="intro-area4__info">
            <div className="intro-area4__info-thumb rr-ov-hidden">
              <img data-speed="0.6" src={asset('build/images/home-4/intro/intro-thumb1_1.jpg')} alt="Développement logiciel et application mobile sur mesure à Douala, Cameroun - Alivaon" />
            </div>
            <div className="intro-area4__info-counter-area">
              <div className="intro-area4__info-counter-area-items wow fadeInUp" data-wow-delay=".3s">
                <h2><span className="count">50</span>+</h2>
                <p className="intro-area4__info-counter-area-items-text">{t('home.hero.counter')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="about-area4 section-spacing rr-ov-hidden">
    <div className="container rr-container-1800">
      <div className="row">
        <div className="col-xl-6">
          <div className="about-area4__items">
            <div className="about-area4__items-thumb rr-ov-hidden">
              <img data-speed="0.8" className="wow fadeInLeft" data-wow-delay=".3s" src={asset('build/images/home-4/about/about-thumb1_1.jpg')} alt="Équipe Alivaon - développement logiciel et digitalisation PME à Douala, Cameroun" />
            </div>
            <div className="section-top4">
              <div className="section-top4__subtitle wow fadeInUp" data-wow-delay=".3s">{t('home.about.subtitle')}</div>
            </div>
          </div>
        </div>
        <div className="col-xl-12">
          <div className="about-area4__content">
            <p className="about-area4__content-subtitle rr-title-anim-2">{t('home.about.text')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="about-feature section-spacing rr-ov-hidden pt-0">
    <div className="container rr-container-1600">
      <div className="about-feature-wrapper">
        <div className="row g-4 d-flex justify-content-center">
          
          <div className="col-xl-5 col-lg-6">
            <div className="tab-content" id="aboutFeatureContent">
              <div className="tab-pane fade show active" id="about-plan1" role="tabpanel">
                <div className="about-feature__thumb rr-ov-hidden">
                  <img data-speed="0.9" src={asset('build/images/home-4/about/about-thumb1_2.jpg')} alt="Alivaon - transparence et communication sur vos projets digitaux au Cameroun" />
                </div>
                <div className="about-feature__button">
                  <a href={path(locale, 'app_about')} className="rr-btn-button4 btn-purple" aria-label={t('home.learn_more_aria')}>{' '}<span className="text">{t('home.learn_more')}</span>{' '}<span className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M22 11C16.6 11 12.2 6.08 12.2 0" stroke="white" strokeWidth="2" /><path d="M12.2 22C12.2 15.93 16.6 11 22 11" stroke="white" strokeWidth="2" /><path d="M22 11H0" stroke="white" strokeWidth="2" /></svg></span>{' '}</a>
                </div>
              </div>
              <div className="tab-pane fade" id="about-plan2" role="tabpanel">
                <div className="about-feature__thumb rr-ov-hidden">
                  <img data-speed="0.9" src={asset('build/images/home-4/about/about-thumb1_2.jpg')} alt="Équipe Alivaon basée à Douala - expertise locale développement logiciel Cameroun" />
                </div>
                <div className="about-feature__button">
                  <a href={path(locale, 'app_about')} className="rr-btn-button4 btn-purple" aria-label={t('home.learn_more_aria')}><span className="text">{t('home.learn_more')}</span><span className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M22 11C16.6 11 12.2 6.08 12.2 0" stroke="white" strokeWidth="2" /><path d="M12.2 22C12.2 15.93 16.6 11 22 11" stroke="white" strokeWidth="2" /><path d="M22 11H0" stroke="white" strokeWidth="2" /></svg></span></a>
                </div>
              </div>
              <div className="tab-pane fade" id="about-plan3" role="tabpanel">
                <div className="about-feature__thumb rr-ov-hidden">
                  <img data-speed="0.9" src={asset('build/images/home-4/about/about-thumb1_2.jpg')} alt="Partenariat durable Alivaon - maintenance et évolution logiciel entreprises Cameroun" />
                </div>
                <div className="about-feature__button wow fadeInUp" data-wow-delay="0.5s">
                  <a href={path(locale, 'app_about')} className="rr-btn-button4 btn-purple" aria-label={t('home.learn_more_aria')}><span className="text">{t('home.learn_more')}</span><span className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M22 11C16.6 11 12.2 6.08 12.2 0" stroke="white" strokeWidth="2" /><path d="M12.2 22C12.2 15.93 16.6 11 22 11" stroke="white" strokeWidth="2" /><path d="M22 11H0" stroke="white" strokeWidth="2" /></svg></span></a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-6 col-lg-6">
            <div className="about-feature-tab-header">
              <div className="nav flex-column" id="aboutFeatureTabs" role="tablist">
                <button className="nav-link active wow fadeInUp" data-wow-delay="0.3s" id="tab1" data-bs-toggle="tab" data-bs-target="#about-plan1" type="button" role="tab" aria-controls="about-plan1" aria-selected="true">{' '}<span className="title">{t('home.tabs.t1_title')}</span>{' '}<span className="subtitle">{t('home.tabs.t1_text')}</span>{' '}</button>{' '}<button className="nav-link wow fadeInUp" data-wow-delay="0.5s" id="tab2" data-bs-toggle="tab" data-bs-target="#about-plan2" type="button" role="tab" aria-controls="about-plan2" aria-selected="false">{' '}<span className="title">{t('home.tabs.t2_title')}</span>{' '}<span className="subtitle">{t('home.tabs.t2_text')}</span>{' '}</button>{' '}<button className="nav-link wow fadeInUp" data-wow-delay="0.7s" id="tab3" data-bs-toggle="tab" data-bs-target="#about-plan3" type="button" role="tab" aria-controls="about-plan3" aria-selected="false">{' '}<span className="title">{t('home.tabs.t3_title')}</span>{' '}<span className="subtitle">{t('home.tabs.t3_text')}</span>{' '}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <section className="service-area4 rr-ov-hidden" style={{ backgroundImage: `url('${asset('build/images/home-4/service/service-bg-thumb1_1.png')}')` }} aria-label={t('home.services_aria')}>
    <div className="container rr-container-1800">
      <div className="row">
        <div className="col-xl-7">
          <div className="section-top4">
            <h2 className="section-top4__subtitle wow fadeInUp" data-wow-delay=".3s">{t('home.services.title')}</h2>
          </div>
        </div>
      </div>
      <div className="row g-4 gy-5 d-flex justify-content-between">
        <div className="col-xl-8 col-lg-7">
          <div className="service-area4__content">
            {services.map((service, index) => (
              <h3 key={service.slug} className={`service-area4__content-title${index % 2 === 0 ? '1' : '2'}`}>
                <a href={path(locale, 'app_service_show', { slug: service.slug })}>{service.title}</a>
              </h3>
            ))}
          </div>
        </div>
        <div className="col-xl-3 col-lg-5">
          <div className="service-area4__items">
            <div className="service-area4__items-thumb rr-ov-hidden">
              <img data-speed="0.8" src={asset('build/images/home-4/service/service-thumb1_1.jpg')} alt="Application mobile Android pour entreprises camerounaises - Alivaon Douala" />
            </div>
            <div className="service-area4__items-content">
              <p className="service-area4__items-content-subtitle">{t('home.services.mobile_text')}</p>
              <ul className="service-area4__items-content-info">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <line x1="12.9346" y1="2.18556e-08" x2="12.9346" y2="10.1739" stroke="white" />
                    <line x1="12.9346" y1="15.8262" x2="12.9346" y2="26.0001" stroke="white" />
                    <line x1="15.8262" y1="13.0652" x2="26.0001" y2="13.0652" stroke="white" />
                    <line y1="13.0652" x2="10.1739" y2="13.0652" stroke="white" />
                  </svg>
                  {t('home.services.f1')}
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <line x1="12.9346" y1="2.18556e-08" x2="12.9346" y2="10.1739" stroke="white" />
                    <line x1="12.9346" y1="15.8262" x2="12.9346" y2="26.0001" stroke="white" />
                    <line x1="15.8262" y1="13.0652" x2="26.0001" y2="13.0652" stroke="white" />
                    <line y1="13.0652" x2="10.1739" y2="13.0652" stroke="white" />
                  </svg>
                  {t('home.services.f2')}
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <line x1="12.9346" y1="2.18556e-08" x2="12.9346" y2="10.1739" stroke="white" />
                    <line x1="12.9346" y1="15.8262" x2="12.9346" y2="26.0001" stroke="white" />
                    <line x1="15.8262" y1="13.0652" x2="26.0001" y2="13.0652" stroke="white" />
                    <line y1="13.0652" x2="10.1739" y2="13.0652" stroke="white" />
                  </svg>
                  {t('home.services.f3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section className="project-area4 section-spacing rr-ov-hidden" aria-label={t('home.projects_aria')}>
    <div className="container rr-container-1800">
      <div className="row g-4 d-flex justify-content-center align-items-center justify-content-between">
        <div className="col-xl-4 col-lg-6 col-md-6">
          <div className="project-area4__thumb" data-speed="1.2" data-lag="0">
            <img src={asset('build/images/home-4/project/project-thumb1_1.jpg')} alt="Logiciel de gestion commerciale développé par Alivaon pour PME camerounaise" />
          </div>
        </div>
        <div className="col-xl-4 col-lg-6 col-md-6 d-flex justify-content-end">
          <div className="project-area4__thumb" data-speed="1.4" data-lag="0">
            <img src={asset('build/images/home-4/project/project-thumb1_2.jpg')} alt="Application mobile Android pour entreprise de transport à Yaoundé - Alivaon" />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12">
          <div className="project-area4__content">
            <h2 className="project-area4__content-text">{t('home.projects.title')}</h2>
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 d-flex align-items-center justify-content-center">
          <div className="project-area4__thumb3" data-speed="1.2" data-lag="0">
            <img src={asset('build/images/home-4/project/project-thumb1_3.jpg')} alt="Solution de gestion des stocks développée par Alivaon pour entreprise à Douala" />
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <div className="wcu-area4 section-spacing rr-ov-hidden pb-0">
    <div className="container">
      <div className="row g-5 d-flex justify-content-center">
        <div className="col-xl-6 col-lg-6 wow fadeInUp" data-wow-delay=".3s">
          <div className="wcu-area4-thumb rr-ov-hidden">
            <img data-speed="0.9" src={asset('build/images/home-4/wcu/wcu-thumb1_1.jpg')} alt="thumb" />
          </div>
        </div>
        <div className="col-xl-6 col-lg-6">
          <div className="wcu-area4-content">
            <div className="section-top4">
              <div className="section-top4__subtitle wow fadeInUp">{t('home.why.subtitle')}</div>
              <div className="section-top4__title wow fadeInUp rr-title-anim-2" data-wow-delay=".3s">{t('home.why.title')}</div>
              <p className="section-top4__text wow fadeInUp" data-wow-delay=".5s">{t('home.why.text')}</p>
            </div>
            <div className="wcu-area4-content__items wow fadeInUp" data-wow-delay=".7s">

              <div className="wcu-area4-content__items-info">
                <div className="wcu-area4-content__items-info__icon">
                  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <path d="M38 0L57 5.09103L70.909 19L76 38L70.909 57L57 70.909L38 76L19 70.909L5.09103 57L0 38L5.09103 19L19 5.09103L38 0Z" fill="#FEBC00" />
                    <rect x="15" y="15" width="46" height="46" fill="url(#pattern_wcu1)" />
                    <defs>
                      <pattern id="pattern_wcu1" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#image_wcu1" transform="scale(0.00195312)" />
                      </pattern>{' '}<image id="image_wcu1" width="512" height="512" preserveAspectRatio="none" xlinkHref={asset('build/images/icon/service-icon-1.png')} />
                    </defs>
                  </svg>
                </div>
                <div className="wcu-area4-content__items-info-content">
                  <div className="wcu-area4-content__items-info-content-title">{t('home.tabs.t1_title')}</div>
                  <p className="wcu-area4-content__items-info-content-desc">{t('home.why.r1')}</p>
                </div>
              </div>

              <div className="wcu-area4-content__items-info">
                <div className="wcu-area4-content__items-info__icon">
                  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <path d="M38 0L57 5.09103L70.909 19L76 38L70.909 57L57 70.909L38 76L19 70.909L5.09103 57L0 38L5.09103 19L19 5.09103L38 0Z" fill="#FEBC00" />
                    <rect x="15" y="15" width="46" height="46" fill="url(#pattern_wcu2)" />
                    <defs>
                      <pattern id="pattern_wcu2" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#image_wcu2" transform="scale(0.00195312)" />
                      </pattern>{' '}<image id="image_wcu2" width="512" height="512" preserveAspectRatio="none" xlinkHref={asset('build/images/icon/service-icon-2.png')} />
                    </defs>
                  </svg>
                </div>
                <div className="wcu-area4-content__items-info-content">
                  <div className="wcu-area4-content__items-info-content-title">{t('home.why.r2_title')}</div>
                  <p className="wcu-area4-content__items-info-content-desc">{t('home.why.r2')}</p>
                </div>
              </div>

              <div className="wcu-area4-content__items-info">
                <div className="wcu-area4-content__items-info__icon">
                  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <path d="M38 0L57 5.09103L70.909 19L76 38L70.909 57L57 70.909L38 76L19 70.909L5.09103 57L0 38L5.09103 19L19 5.09103L38 0Z" fill="#FEBC00" />
                    <rect x="15" y="15" width="46" height="46" fill="url(#pattern_wcu3)" />
                    <defs>
                      <pattern id="pattern_wcu3" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#image_wcu3" transform="scale(0.00195312)" />
                      </pattern>{' '}<image id="image_wcu3" width="512" height="512" preserveAspectRatio="none" xlinkHref={asset('build/images/icon/service-icon-3.png')} />
                    </defs>
                  </svg>
                </div>
                <div className="wcu-area4-content__items-info-content">
                  <div className="wcu-area4-content__items-info-content-title">{t('home.why.r3_title')}</div>
                  <p className="wcu-area4-content__items-info-content-desc">{t('home.why.r3')}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="brand-area4 section-spacing" aria-label={t('home.clients_aria')}>
    <div className="container rr-container-1800">
      <div className="brand-area4-wrapper">
        <div className="swiper brand-slider">
          <div className="swiper-wrapper">
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_1.png')} alt="Client Alivaon Cameroun" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_2.png')} alt="Client Alivaon Cameroun" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_3.png')} alt="Client Alivaon Douala" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_4.png')} alt="Client Alivaon Douala" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_5.png')} alt="Client Alivaon Cameroun" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_6.png')} alt="Client Alivaon Cameroun" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_1.png')} alt="Partenaire Alivaon Cameroun" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_2.png')} alt="Partenaire Alivaon Cameroun" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_3.png')} alt="Partenaire Alivaon Douala" /></div></div>
            <div className="swiper-slide"><div className="brand-area4__image"><img src={asset('build/images/home-4/brand/brand-thumb1_4.png')} alt="Partenaire Alivaon Douala" /></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <section className="testimonial-area4 section-spacing rr-ov-hidden" aria-label={t('service.index.testimonials_aria')}>
    <div className="container rr-container-1600">
      <div className="row gy-5 d-flex justify-content-center">
        <div className="col-xl-7 d-flex justify-content-center">
          <div className="section-top4 text-center">
            <div className="section-top4__subtitle wow fadeInUp" data-wow-delay=".3s">{t('home.testimonials.subtitle')}</div>
            <h2 className="section-top4__title mb-0 wow fadeInUp rr-title-anim-2" data-wow-delay=".5s">{t('home.testimonials.title')}</h2>
          </div>
        </div>
      </div>
      <div className="row gy-5 d-flex justify-content-between">
        <div className="col-xl-9 col-lg-8">
          <div className="swiper testimonial4-slider">
            <div className="swiper-wrapper">

              {testimonials.map((testimonial, index) => (
                  <div key={index} className="swiper-slide">
                    <div className="testimonial-area4__card">
                      <div className="video-box">
                        <a href={path(locale, 'app_home')} className="video-buttton" aria-label={t('home.testimonials.video_aria')}>
                          <div className="arrow-button"><img src={asset('build/images/home-4/testimonial/video-icon1_1.png')} alt="Icône vidéo témoignage" /></div>
                          <img src={asset('build/images/home-4/testimonial/circle-text.png')} alt="" className="text-circle" aria-hidden="true" />{' '}</a>
                      </div>
                      <div className="testimonial-area4__card-items">
                        <div className="testimonial-area4__card-items-icon">
                          <img src={asset('build/images/home-4/testimonial/stars.svg')} alt={t('home.testimonials.stars_alt')} style={{ height: '18px' }} />
                        </div>
                        <div className="testimonial-area4__card-items-content">
                          <p className="testimonial-area4__card-items-content-subtitle">{testimonial.content}</p>
                        </div>
                        <div className="testimonial-area4__card-items-mentor-items">
                          <div className="testimonial-area4__card-items-mentor-items-info">
                            <div className="testimonial-area4__card-items-mentor-items-info-thumb">
                              <img src={testimonial.avatar ?? asset('build/images/home-4/testimonial/testimonial-image1_1.png')} alt={`${testimonial.clientName} - client Alivaon Cameroun`} />
                            </div>
                            <div className="testimonial-area4__card-items-mentor-items-info-content">
                              <h3 className="testimonial-area4__card-items-mentor-items-info-content-title">{testimonial.clientName}</h3>
                              <p className="testimonial-area4__card-items-mentor-items-info-content-subtitle">{testimonial.clientPosition}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

            </div>
          </div>
          <div className="testimonial-area4__controls">
            <div className="testimonial-area4__controls-arrowRight"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none" aria-hidden="true"><path d="M16.6154 21V7.7H2.65985L7.91169 13.0088L6.93138 14.0084L0 7L6.92308 0L7.91169 0.9996L2.65846 6.3H18V21H16.6154Z" fill="white" /></svg></div>
            <div className="testimonial-area4__controls-arrowLeft"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none" aria-hidden="true"><path d="M1.38461 21V7.7H15.3402L10.0883 13.0088L11.0686 14.0084L18 7L11.0769 0L10.0883 0.9996L15.3415 6.3H0V21H1.38461Z" fill="black" /></svg></div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4">
          <div className="testimonial-area4__content wow fadeInUp" data-wow-delay=".3s">
            <h3 className="testimonial-area4__content-title">{t('home.testimonials.count_title')}</h3>
            <div className="testimonial-area4__content-thumb">
              <img src={asset('build/images/home-4/testimonial/testimonial-client-image1_1.png')} alt="Clients Alivaon - PME camerounaises digitalisées à Douala et Yaoundé" />
            </div>
            <p className="testimonial-area4__content-subtitle">{t('home.testimonials.count_text')}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section className="video-area4 rr-ov-hidden" style={{ backgroundImage: `url('${asset('build/images/home-4/video/video-bg-thumb1_1.png')}')` }}>
    <div className="container rr-container-1800">
      <div className="row g-4 d-flex justify-content-between">
        <div className="col-xl-8 col-lg-7">
          <div className="video-area4__items">
            <h2 className="video-area4__items-title rr-title-anim-2">{t('home.video.title')}</h2>
            <div className="video-area4__items-thumb rr-ov-hidden">
              <img data-speed="0.8" src={asset('build/images/home-4/video/video-thumb1_1.jpg')} alt="Alivaon - résultats de la digitalisation pour entreprises camerounaises à Douala" />
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-lg-3 d-flex justify-content-end">
          <div className="video-area4-info">
            <div className="video-area4-info__counter wow fadeInUp" data-wow-delay="0.6s">
              <h3 className="video-area4-info__counter-title"><span className="odometer count" data-count="98">98</span>%</h3>
              <p className="video-area4-info__counter-text">{t('service.index.kpi4')}</p>
            </div>
            <div className="video-area4-info__counter wow fadeInUp" data-wow-delay="0.7s">
              <h3 className="video-area4-info__counter-title"><span className="odometer count" data-count="10">10</span>+</h3>
              <p className="video-area4-info__counter-text">{t('service.index.kpi3')}</p>
            </div>
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12">
          <div className="video-area4__content wow fadeInUp" data-wow-delay="0.3s">
            <h2 className="video-area4__content-title">{t('home.video.approach')}</h2>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section className="wp-area4 section-spacing rr-ov-hidden">
    <div className="container rr-container-1600">
      <div className="row g-4 d-flex justify-content-between">
        <div className="col-xl-5 col-lg-7">
          <div className="section-top4">
            <div className="section-top4__subtitle wow fadeInUp">{t('home.wwd.subtitle')}</div>
            <h2 className="section-top4__title wow fadeInUp" data-wow-delay=".3s">{t('home.wwd.title')}</h2>
            <p className="section-top4__text wow fadeInUp" data-wow-delay=".5s">{t('home.wwd.text')}</p>
          </div>
          <div className="wp-area4-wrapper">
            <div className="wp-area4-wrapper__progress-wrap">

              <div className="wp-area4-wrapper__progress-wrap-pro-items wow fadeInUp" data-wow-delay=".5s">
                <div className="pro-head">
                  <h3 className="title">{t('home.wwd.p1')}</h3>
                  <span className="point"><span className="odometer" data-count="93">93</span>%</span>
                </div>
                <div className="progress">
                  <div className="progress-value style-one"></div>
                </div>
              </div>

              <div className="wp-area4-wrapper__progress-wrap-pro-items wow fadeInUp" data-wow-delay=".5s">
                <div className="pro-head">
                  <h3 className="title">{t('home.wwd.p2')}</h3>
                  <span className="point"><span className="odometer" data-count="87">87</span>%</span>
                </div>
                <div className="progress">
                  <div className="progress-value style-four"></div>
                </div>
              </div>

              <div className="wp-area4-wrapper__progress-wrap-pro-items wow fadeInUp" data-wow-delay=".7s">
                <div className="pro-head">
                  <h3 className="title">{t('home.wwd.p3')}</h3>
                  <span className="point"><span className="odometer" data-count="90">90</span>%</span>
                </div>
                <div className="progress mb-0">
                  <div className="progress-value style-three"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="col-xl-6 col-lg-5">
          <div className="wp-area4__items">
            <div className="wp-area4__items-thumb">
              <img src={asset('build/images/home-4/wp/wp-thumb1_1.png')} alt="Interface logiciel de gestion développé par Alivaon pour PME camerounaise" />
            </div>
            <a href={path(locale, 'app_service_index')} className="rr-btn-button4 btn-purple wow fadeInUp" data-wow-delay="0.3s" aria-label={t('home.wwd.services_aria')}>{' '}<span className="text">{t('home.wwd.services_button')}</span>{' '}<span className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M22 11C16.6 11 12.2 6.08 12.2 0" stroke="white" strokeWidth="2"></path><path d="M12.2 22C12.2 15.93 16.6 11 22 11" stroke="white" strokeWidth="2"></path><path d="M22 11H0" stroke="white" strokeWidth="2"></path></svg></span>{' '}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section className="pricing-area4 section-spacing rr-ov-hidden">
    <div className="container rr-container-1600">
      <div className="row gy-5 d-flex justify-content-center">
        <div className="col-xl-7 d-flex justify-content-center">
          <div className="section-top4 text-center">
            <div className="section-top4__subtitle wow fadeInUp" data-wow-delay=".3s">{t('home.pricing.subtitle')}</div>
            <h2 className="section-top4__title mb-0 wow fadeInUp rr-title-anim-2" data-wow-delay=".5s">{t('home.pricing.title')}</h2>
          </div>
        </div>
      </div>
      <div className="pricing-area4__wrapper">
        <div className="row g-4 d-flex justify-content-center">

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="pricing-area4__items wow fadeInUp" data-wow-delay=".3s">
              <div className="pricing-area4__items-header">
                <span className="pricing-area4__items-header-subtitle">{t('home.pricing.p1_name')}</span>
                <h3 className="pricing-area4__items-header-title">
                  <sub>{t('home.pricing.p1_desc')}</sub>
                </h3>
              </div>
              <div className="pricing-area4__items-info">
                <ul className="pricing-area4__items-info-list">
                  <li><PricingIcon /> {t('home.pricing.f_analysis')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_agile')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_tests')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_delivery')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_support')}</li>
                </ul>
              </div>
              <div className="pricing-area4__items-button">
                <a href={path(locale, 'app_contact')} className="pricing-area4__items-button-pricing-btn mt-4">{t('home.pricing.cta')}</a>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="pricing-area4__items active wow fadeInUp" data-wow-delay=".6s">
              <div className="pricing-area4__items-header">
                <span className="pricing-area4__items-header-subtitle">{t('home.pricing.p2_name')}</span>
                <h3 className="pricing-area4__items-header-title">
                  <sub>{t('home.pricing.p2_desc')}</sub>
                </h3>
              </div>
              <div className="pricing-area4__items-info">
                <ul className="pricing-area4__items-info-list">
                  <li><PricingIcon /> {t('home.pricing.f_analysis_deep')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_agile')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_tests_business')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_delivery_training')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_support')}</li>
                </ul>
              </div>
              <div className="pricing-area4__items-button">
                <a href={path(locale, 'app_contact')} className="pricing-area4__items-button-pricing-btn mt-4">{t('home.pricing.cta')}</a>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="pricing-area4__items wow fadeInUp" data-wow-delay=".8s">
              <div className="pricing-area4__items-header">
                <span className="pricing-area4__items-header-subtitle">{t('home.pricing.p3_name')}</span>
                <h3 className="pricing-area4__items-header-title">
                  <sub>{t('home.pricing.p3_desc')}</sub>
                </h3>
              </div>
              <div className="pricing-area4__items-info">
                <ul className="pricing-area4__items-info-list">
                  <li><PricingIcon /> {t('home.pricing.f_audit')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_agile')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_qa')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_delivery_training')}</li>
                  <li><PricingIcon /> {t('home.pricing.f_support')}</li>
                </ul>
              </div>
              <div className="pricing-area4__items-button">
                <a href={path(locale, 'app_contact')} className="pricing-area4__items-button-pricing-btn mt-4">{t('home.pricing.cta')}</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  
  <section className="blog-area4 section-spacing rr-ov-hidden" aria-label={t('home.blog_aria')}>
    <div className="container rr-container-1600">
      <div className="row gy-5 d-flex align-items-center justify-content-between">
        <div className="col-xl-7 d-flex justify-content-start">
          <div className="section-top4">
            <div className="section-top4__subtitle wow fadeInUp" data-wow-delay=".3s">{t('home.blog.subtitle')}</div>
            <h2 className="section-top4__title mb-0 wow fadeInUp" data-wow-delay=".5s">{t('home.blog.title')}</h2>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="blog-area4__button">
            <a href={path(locale, 'app_blog_index')} className="rr-btn-button btn-purple" aria-label={t('home.blog.all_aria')}>{' '}<span className="text">{t('home.blog.all')}</span>{' '}<span className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><g clipPath="url(#clip_blog_btn)"><path d="M22.0004 11C16.6011 11 12.2227 6.07578 12.2227 0" stroke="white" strokeWidth="2" strokeMiterlimit="10" /><path d="M12.2227 22C12.2227 15.9258 16.5997 11 22.0004 11" stroke="white" strokeWidth="2" strokeMiterlimit="10" /><path d="M22.0005 11H0.000488281" stroke="white" strokeWidth="2" strokeMiterlimit="10" /></g><defs><clipPath id="clip_blog_btn"><rect width="22" height="22" fill="white" /></clipPath></defs></svg></span>{' '}</a>
          </div>
        </div>
      </div>
      <div className="blog-area4-wrapper">
        <div className="swiper blog-slider">
          <div className="swiper-wrapper">

            {posts.map((post) => (
                <div key={post.slug} className="swiper-slide">
                  <div className="blog-area4__card">
                    <div className="blog-area4__card-content">
                      <ul className="blog-area4__card-content-list">
                        <li>{post.category ? post.category.name : t('blog.uncategorized')}</li>
                        <li>{twigDate(post.publishedAt, 'd M Y')}</li>
                      </ul>
                      <h3 className="blog-area4__card-content-title">{post.title}</h3>
                      {post.excerpt && <p className="blog-area4__card-content-subtitle">{post.excerpt}</p>}{' '}<a className="blog-area4__card-content-link" href={path(locale, 'app_blog_show', { slug: post.slug })} aria-label={t('blog.show.read_article', { '%title%': post.title })}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><g clipPath="url(#clip_blog_link)"><path d="M23.2462 7.96095C19.4712 11.8212 12.8893 11.5088 8.54541 7.26074" stroke="#F0F2F4" strokeWidth="2" strokeMiterlimit="10" /><path d="M24.2746 22.643C19.9319 18.3961 19.4704 11.8228 23.2465 7.96148" stroke="#F0F2F4" strokeWidth="2" strokeMiterlimit="10" /><path d="M23.2465 7.96141L7.86475 23.6904" stroke="#F0F2F4" strokeWidth="2" strokeMiterlimit="10" /></g><defs><clipPath id="clip_blog_link"><rect width="22" height="22" fill="white" transform="translate(0 16) rotate(-45.6395)" /></clipPath></defs></svg>
                      </a>
                    </div>
                    <div className="blog-area4__card-thumb">
                      <img src={post.featuredImage ?? asset('build/images/home-4/blog/blog-thumb1_1.jpg')} alt={post.title} />
                    </div>
                  </div>
                </div>
              ))}

          </div>
        </div>
        <div className="blog-area4-wrapper-controls">
          <div className="blog-area4-wrapper-controls__arrowRight"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none" aria-hidden="true"><path d="M16.6154 21V7.7H2.65985L7.91169 13.0088L6.93138 14.0084L0 7L6.92308 0L7.91169 0.9996L2.65846 6.3H18V21H16.6154Z" fill="white" /></svg></div>
          <div className="blog-area4-wrapper-controls__arrowLeft"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none" aria-hidden="true"><path d="M1.38461 21V7.7H15.3402L10.0883 13.0088L11.0686 14.0084L18 7L11.0769 0L10.0883 0.9996L15.3415 6.3H0V21H1.38461Z" fill="black" /></svg></div>
        </div>
      </div>
    </div>
  </section>
    </PageShell>
  );
}
