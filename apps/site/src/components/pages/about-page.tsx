import { JsonLd, PageShell } from '@/components/layout/page-shell';
import { api, cached, load, members } from '@/lib/api';
import { absoluteUrl, asset, SITE_ORIGIN } from '@/lib/config';
import { socialLinks, staticAlternates } from '@/lib/pages';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** about/index.html.twig */
export async function AboutPage({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const [teamMembers, testimonials] = await Promise.all([
    load(api.GET('/api/public/{locale}/team-members', { params: { path: { locale }, query: { limit: 3 } }, fetch: cached('team-members') })).then(members),
    load(api.GET('/api/public/{locale}/testimonials', { params: { path: { locale } }, fetch: cached('testimonials') })).then(members),
  ]);

  return (
    <PageShell
      page={{ locale, route: 'app_about', alternates: staticAlternates('app_about') }}
      bodyBackground="#F0F2F4"
      seo={{
        pathname: path(locale, 'app_about'),
        title: t('about.title'),
        description: t('about.meta_description'),
        ogTitle: t('about.og_title'),
        ogDescription: t('about.og_description'),
        extra: (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Alivaon',
              description: t('about.jsonld_description'),
              url: SITE_ORIGIN,
              logo: absoluteUrl(asset('build/images/logo/logo.png')),
              telephone: '+237691962158',
              email: 'contact@alivaon.com',
              address: { '@type': 'PostalAddress', streetAddress: 'Logpom', addressLocality: 'Douala', addressRegion: 'Littoral', addressCountry: 'CM' },
              areaServed: ['Douala', 'Yaoundé', 'Cameroun', 'Afrique centrale'],
              serviceType: [
                'Développement logiciel sur mesure',
                'Application web',
                'Application mobile Android',
                'Logiciel de gestion entreprise',
                'Digitalisation PME',
                'Logiciel de facturation',
                'Solution de gestion des stocks',
              ],
              foundingDate: '2014',
              numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 50 },
              sameAs: ['https://www.linkedin.com/company/alivaon', 'https://www.facebook.com/alivaon'],
            }}
          />
        ),
      }}
    >
      <div className="breadcrumb1 section-bg overflow-hidden">
    <div className="container rr-container-1600">
      <div className="breadcrumb1__top">
        <div className="breadcrumb1__top-left">{t('nav.about_short')}</div>
        <div className="breadcrumb1__top-right">
          <div className="breadcrumb1__top-right-img">
            <img src={asset('build/images/inner/breadcrumb/breadcrumb-img1_1.png')} alt="Alivaon agence digitale Douala Cameroun" />
          </div>
          <div className="breadcrumb1__top-right-text">{t('service.index.badge')}</div>
        </div>
      </div>
      <h1 className="breadcrumb1__title">{t('about.h1')}</h1>
    </div>
    <div className="breadcrumb1__abouttext">
      {t('about.word_innovation')} <img src={asset('build/images/inner/about/about-breadcumbthumb.jpg')} alt={t('about.breadcrumb_img_alt')} /> {t('about.word_proximity')}
    </div>
    <div className="breadcrumb1__thumb rr-ov-hidden wow fadeInUp" data-wow-delay="0.3s">
      <img data-speed="0.9" src={asset('build/images/inner/breadcrumb/breadcrumb-thumb1_2.jpg')} alt="Équipe Alivaon - développement logiciel et application mobile à Douala, Cameroun" />
    </div>
  </div>

  
  <div className="value section-spacing overflow-hidden">
    <div className="container container-1800">
      <div className="section-top7">
        <div className="row gy-5 d-flex align-items-end justify-content-between">
          <div className="col-xl-10 d-flex justify-content-start">
            <div>
              <div className="section-top7__subtitle wow fadeInUp" data-wow-delay=".3s">{t('about.values.subtitle')}</div>
              <h2 className="section-top7__title mb-0 wow fadeInUp" data-wow-delay=".5s">{t('about.values.title')}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="value__list-wrap">
        <div className="value__list active wow fadeInUp" data-wow-delay="0.3s">
          <div className="value__left">
            <div className="value__number">01.</div>
            <div className="value__title">
              <img src={asset('build/images/inner/about/value/value-thumb1.jpg')} alt="Solutions logicielles adaptées au marché camerounais" />{' '}<span>{t('about.values.v1_title')}</span>
            </div>
          </div>
          <div className="value__desc">{t('about.values.v1_text')}</div>
        </div>

        <div className="value__list wow fadeInUp" data-wow-delay="0.6s">
          <div className="value__left">
            <div className="value__number">02.</div>
            <div className="value__title">
              <img src={asset('build/images/inner/about/value/value-thumb2.jpg')} alt="Partenariat transparent avec les entreprises camerounaises" />{' '}<span>{t('about.values.v2_title')}</span>
            </div>
          </div>
          <div className="value__desc">{t('about.values.v2_text')}</div>
        </div>

        <div className="value__list wow fadeInUp" data-wow-delay="0.9s">
          <div className="value__left">
            <div className="value__number">03.</div>
            <div className="value__title">
              <img src={asset('build/images/inner/about/value/value-thumb3.jpg')} alt="Excellence technique développement logiciel Douala" />{' '}<span>{t('about.values.v3_title')}</span>
            </div>
          </div>
          <div className="value__desc">{t('about.values.v3_text')}</div>
        </div>

        <div className="value__list wow fadeInUp" data-wow-delay="0.3s">
          <div className="value__left">
            <div className="value__number">04.</div>
            <div className="value__title">
              <img src={asset('build/images/inner/about/value/value-thumb4.jpg')} alt="Impact concret sur la gestion et les ventes des PME camerounaises" />{' '}<span>{t('about.values.v4_title')}</span>
            </div>
          </div>
          <div className="value__desc">{t('about.values.v4_text')}</div>
        </div>
      </div>

      <div className="value__thumb section-spacing pb-0 wow fadeInUp" data-wow-delay="0.3s">
        <div className="value-thumb__one rr-ov-hidden rounded-5">
          <img className="rounded-5" data-speed="0.9" src={asset('build/images/inner/about/value/value-big-thumb1.jpg')} alt="Développement logiciel sur mesure à Douala - équipe Alivaon au travail" />
        </div>
        <div className="value-thumb__two rr-ov-hidden rounded-5">
          <img className="rounded-5" data-speed="0.9" src={asset('build/images/inner/about/value/value-big-thumb2.jpg')} alt="Application mobile et solution digitale pour PME camerounaises" />
        </div>
      </div>
    </div>
  </div>

  
  <div className="awards overflow-hidden">

    
    <div className="marque-section6 rr-ov-hidden">
      <div className="marquee-wrapper text-slider-1">
        <div className="marquee-inner to-left">
          <ul className="marqee-list d-flex">
            <li className="marquee-item">
              <span className="text-slider-1">{t('about.marquee.1')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.2')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.3')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.4')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.5')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.6')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.7')}</span>{' '}<span className="text-slider-2"> • </span>{' '}<span className="text-slider-1">{t('about.marquee.8')}</span>{' '}<span className="text-slider-2"> • </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="container container-1800">
      <div className="awards__list-wrap section-spacing">
        <div className="awards__list">
          <div className="awards__name">{t('about.awards.a1_name')}</div>
          <div className="awards__topic">{t('about.awards.a1_topic')}</div>
          <div className="awards__date">2014 →</div>
        </div>
        <div className="awards__list">
          <div className="awards__name">{t('about.awards.a2_name')}</div>
          <div className="awards__topic">{t('about.awards.a2_topic')}</div>
          <div className="awards__date">2024</div>
        </div>
        <div className="awards__list">
          <div className="awards__name">{t('about.awards.a3_name')}</div>
          <div className="awards__topic">{t('about.awards.a3_topic')}</div>
          <div className="awards__date">2024</div>
        </div>
        <div className="awards__list">
          <div className="awards__name">{t('about.awards.a4_name')}</div>
          <div className="awards__topic">{t('about.awards.a4_topic')}</div>
          <div className="awards__date">2024</div>
        </div>
        <div className="awards__list">
          <div className="awards__name">{t('about.awards.a5_name')}</div>
          <div className="awards__topic">{t('about.awards.a5_topic')}</div>
          <div className="awards__date">2024</div>
        </div>
      </div>
    </div>
  </div>

  
  <section className="testimonial-5__area section-spacing pb-0 bg-white overflow-hidden" aria-label={t('service.index.testimonials_aria')}>
    <div className="container container-1800">
      <div className="testimonial-5__wrapper">
        <div className="swiper testimonial-5__active">
          <div className="swiper-wrapper">

            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <div key={testimonial.id} className="swiper-slide">
                  <div className="testimonial-5__item">
                    <div className="testimonial-5__quote">
                      <svg width="138" height="109" viewBox="0 0 138 109" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M58.8991 7.77194L53.8918 0C19.247 23.5085 0 52.0721 0 75.5806C0 98.3119 16.5556 109 30.6044 109C48.3117 109 60.8207 93.8416 60.8207 77.9122C60.8207 64.5072 52.352 53.042 40.9948 48.7644C37.7242 47.5955 34.6447 46.6255 34.6447 40.9923C34.6447 33.8049 39.843 23.1231 58.8991 7.77194ZM135.308 7.77194L130.301 0C96.0383 23.5085 76.4094 52.0721 76.4094 75.5806C76.4094 98.3119 93.3468 109 107.396 109C125.294 109 138 93.8416 138 77.9122C138 64.5072 129.34 53.042 117.595 48.7644C114.325 47.5955 111.436 46.6255 111.436 40.9923C111.436 33.8049 116.825 23.1168 135.302 7.76573L135.308 7.77194Z" fill="#36A9E1" />
                      </svg>
                    </div>
                    <p className="testimonial-5__desc">{testimonial.content}</p>
                    <div className="testimonial-5__author">
                      <div className="testimonial-5__thumb">
                        <img src={testimonial.avatar ?? asset('build/images/testimonial/author-5-01.png')} alt={`${testimonial.clientName} - client Alivaon`} />
                      </div>
                      <h3 className="testimonial-5__name">
                        {`${testimonial.clientName}${testimonial.clientPosition ? `, ${testimonial.clientPosition}` : ''}`}
                      </h3>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="swiper-slide">
                <div className="testimonial-5__item">
                  <div className="testimonial-5__quote">
                    <svg width="138" height="109" viewBox="0 0 138 109" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M58.8991 7.77194L53.8918 0C19.247 23.5085 0 52.0721 0 75.5806C0 98.3119 16.5556 109 30.6044 109C48.3117 109 60.8207 93.8416 60.8207 77.9122C60.8207 64.5072 52.352 53.042 40.9948 48.7644C37.7242 47.5955 34.6447 46.6255 34.6447 40.9923C34.6447 33.8049 39.843 23.1231 58.8991 7.77194ZM135.308 7.77194L130.301 0C96.0383 23.5085 76.4094 52.0721 76.4094 75.5806C76.4094 98.3119 93.3468 109 107.396 109C125.294 109 138 93.8416 138 77.9122C138 64.5072 129.34 53.042 117.595 48.7644C114.325 47.5955 111.436 46.6255 111.436 40.9923C111.436 33.8049 116.825 23.1168 135.302 7.76573L135.308 7.77194Z" fill="#36A9E1" />
                    </svg>
                  </div>
                  <p className="testimonial-5__desc">{t('about.testimonial1')}</p>
                  <div className="testimonial-5__author">
                    <div className="testimonial-5__thumb">
                      <img src={asset('build/images/testimonial/author-5-01.png')} alt="Directeur général PME Douala - client Alivaon" />
                    </div>
                    <h3 className="testimonial-5__name">{t('about.testimonial1_author')}</h3>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="testimonial-5__item">
                  <div className="testimonial-5__quote">
                    <svg width="138" height="109" viewBox="0 0 138 109" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M58.8991 7.77194L53.8918 0C19.247 23.5085 0 52.0721 0 75.5806C0 98.3119 16.5556 109 30.6044 109C48.3117 109 60.8207 93.8416 60.8207 77.9122C60.8207 64.5072 52.352 53.042 40.9948 48.7644C37.7242 47.5955 34.6447 46.6255 34.6447 40.9923C34.6447 33.8049 39.843 23.1231 58.8991 7.77194ZM135.308 7.77194L130.301 0C96.0383 23.5085 76.4094 52.0721 76.4094 75.5806C76.4094 98.3119 93.3468 109 107.396 109C125.294 109 138 93.8416 138 77.9122C138 64.5072 129.34 53.042 117.595 48.7644C114.325 47.5955 111.436 46.6255 111.436 40.9923C111.436 33.8049 116.825 23.1168 135.302 7.76573L135.308 7.77194Z" fill="#36A9E1" />
                    </svg>
                  </div>
                  <p className="testimonial-5__desc">{t('about.testimonial2')}</p>
                  <div className="testimonial-5__author">
                    <div className="testimonial-5__thumb">
                      <img src={asset('build/images/testimonial/author-5-01.png')} alt="CEO startup Yaoundé Cameroun - client Alivaon" />
                    </div>
                    <h3 className="testimonial-5__name">{t('about.testimonial2_author')}</h3>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="testimonial-5__item">
                  <div className="testimonial-5__quote">
                    <svg width="138" height="109" viewBox="0 0 138 109" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M58.8991 7.77194L53.8918 0C19.247 23.5085 0 52.0721 0 75.5806C0 98.3119 16.5556 109 30.6044 109C48.3117 109 60.8207 93.8416 60.8207 77.9122C60.8207 64.5072 52.352 53.042 40.9948 48.7644C37.7242 47.5955 34.6447 46.6255 34.6447 40.9923C34.6447 33.8049 39.843 23.1231 58.8991 7.77194ZM135.308 7.77194L130.301 0C96.0383 23.5085 76.4094 52.0721 76.4094 75.5806C76.4094 98.3119 93.3468 109 107.396 109C125.294 109 138 93.8416 138 77.9122C138 64.5072 129.34 53.042 117.595 48.7644C114.325 47.5955 111.436 46.6255 111.436 40.9923C111.436 33.8049 116.825 23.1168 135.302 7.76573L135.308 7.77194Z" fill="#36A9E1" />
                    </svg>
                  </div>
                  <p className="testimonial-5__desc">{t('about.testimonial3')}</p>
                  <div className="testimonial-5__author">
                    <div className="testimonial-5__thumb">
                      <img src={asset('build/images/testimonial/author-5-01.png')} alt="Directeur PME industrielle Cameroun - client Alivaon" />
                    </div>
                    <h3 className="testimonial-5__name">{t('about.testimonial3_author')}</h3>
                  </div>
                </div>
              </div>
              </>
            )}

          </div>
          <div className="testimonial-5__arrow">
            <div className="testimonial-5__swiper-button-prev"></div>
            <div className="testimonial-5__swiper-button-next"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <div className="brand-slide-5__area section-spacing bg-white overflow-hidden" aria-label={t('home.clients_aria')}>
    <div className="container container-1800">

      {/* Clients : le contrôleur Symfony ne fournit pas « clients » : seule la version statique s'affiche. */}
      <div dir="rtl" className="brand-section-5__slide">
          <div className="swiper brand-section-5__active">
            <div className="swiper-wrapper">
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_01.png')} alt="Client partenaire Alivaon Cameroun" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_02.png')} alt="Client partenaire Alivaon Cameroun" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_03.png')} alt="Client partenaire Alivaon Cameroun" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_04.png')} alt="Client partenaire Alivaon Cameroun" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_05.png')} alt="Client partenaire Alivaon Cameroun" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_06.png')} alt="Client partenaire Alivaon Cameroun" /></div></div>
            </div>
          </div>
        </div>
        <div dir="ltr" className="brand-section-5__slide">
          <div className="swiper brand-section-5__active">
            <div className="swiper-wrapper">
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_07.png')} alt="Client partenaire Alivaon Douala" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_08.png')} alt="Client partenaire Alivaon Douala" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_09.png')} alt="Client partenaire Alivaon Douala" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_10.png')} alt="Client partenaire Alivaon Douala" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_11.png')} alt="Client partenaire Alivaon Douala" /></div></div>
              <div className="swiper-slide"><div className="brand-section-5__item"><img src={asset('build/images/brand/brand-5_12.png')} alt="Client partenaire Alivaon Douala" /></div></div>
            </div>
          </div>
        </div>

    </div>
  </div>

  
  <div className="video__wrap overflow-hidden">
    <div className="container">
      <div className="video-thumb">
        <img src={asset('build/images/inner/about/video/video-thumb.jpg')} alt="Alivaon - agence de développement logiciel et application mobile à Douala, Cameroun" />
      </div>
    </div>
    <div className="video bg-img" data-bg-src={asset('build/images/inner/about/video/video-bg.jpg')}>
      <div className="video-title">
        <span>{t('about.video.watch_our')}</span>{' '}<img className="rotate-spin" src={asset('build/images/inner/about/video/video-icon.png')} alt={t('about.video.play_alt')} />{' '}<span>{t('about.video.presentation')}</span>
      </div>
    </div>
  </div>

  
  <div className="team-achievement section-bg section-spacing rr-ov-hidden pb-0 overflow-hidden">
    <div className="container rr-container-1800">
      <div className="row g-4 d-flex justify-content-center">
        <div className="col-xl-5 col-lg-5 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="30">30</span>+</div>
            <p className="team-achievement__card-text">{t('service.index.kpi1')}</p>
          </div>
        </div>
        <div className="col-xl-7 col-lg-7 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="50">50</span>+</div>
            <p className="team-achievement__card-text">{t('about.kpi2')}</p>
          </div>
        </div>
        <div className="col-xl-7 col-lg-7 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="10">10</span>+</div>
            <p className="team-achievement__card-text">{t('about.kpi3')}</p>
          </div>
        </div>
        <div className="col-xl-5 col-lg-5 col-md-6">
          <div className="team-achievement__card">
            <div className="team-achievement__card-title"><span className="odometer" data-count="98">98</span>%</div>
            <p className="team-achievement__card-text">{t('service.index.kpi4')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="team section-spacing overflow-hidden">
    <div className="container">
      <div className="section-top7">
        <div className="row gy-5 d-flex align-items-end justify-content-between">
          <div className="col-xl-7 d-flex justify-content-start">
            <div>
              <div className="section-top7__subtitle wow fadeInUp" data-wow-delay=".3s">{t('about.team.subtitle')}</div>
              <h2 className="section-top7__title mb-0 wow fadeInUp" data-wow-delay=".5s">{t('about.team.title')}</h2>
            </div>
          </div>
          <div className="col-xl-5 d-flex justify-content-end">
            <a href={path(locale, 'app_team_index')} className="rr-btn-border" aria-label={t('about.team.all_aria')}>{' '}<span className="text">{t('about.team.all')}</span>{' '}<span className="icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g clipPath="url(#clip0_22_142)">
                    <path d="M22.0004 10.9995C16.6011 10.9995 12.2227 6.07534 12.2227 -0.00044632" stroke="#101010" strokeWidth="2" strokeMiterlimit="10"></path>
                    <path d="M12.2227 21.9995C12.2227 15.9253 16.5997 10.9995 22.0004 10.9995" stroke="#101010" strokeWidth="2" strokeMiterlimit="10"></path>
                    <path d="M22.0005 10.9995H0.000488281" stroke="#101010" strokeWidth="2" strokeMiterlimit="10"></path>
                  </g>
                </svg>
              </span>{' '}</a>
          </div>
        </div>
      </div>

      <div className="row g-4 d-flex justify-content-between">

        {teamMembers.map((member) => (
          <div key={member.slug} className="col-xl-4 col-lg-4 col-md-6">
            <div className="team-section__card">
              <div className="team-section__card-thumb rr-ov-hidden">
                <img data-speed="0.9" src={member.photo ?? asset('build/images/inner/team/team-thumb1_2.jpg')} alt={`${member.fullName} - ${member.position} chez Alivaon Douala`} />
              </div>
              <div className="team-section__card-items">
                <ul className="team-section__card-items-list">
                  {socialLinks(member.socialLinks).length > 0 ? (
                    socialLinks(member.socialLinks).map(([network, url]) => (
                      <li key={network}>
                        <a href={url} aria-label={`${member.fullName} sur ${network}`}>{' '}{network.toUpperCase()}{' '}</a>
                      </li>
                    ))
                  ) : (
                    <li>LINKEDIN</li>
                  )}
                </ul>
              </div>
              <div className="team-section__card-content">
                <h3 className="team-section__card-content-title">
                  <a href={path(locale, 'app_team_show', { slug: member.slug })} className="team-section__card-content-title-name">{' '}{member.fullName}{' '}</a>
                </h3>
                <p className="team-section__card-content-subtitle">{member.position}</p>
              </div>
            </div>
          </div>
        ))}

      </div>

      
      <div className="text-center" style={{ marginTop: '4rem' }}>
        <a href={path(locale, 'app_contact')} className="btn btn-info" aria-label={t('about.cta_aria')}>{' '}{t('portfolio.cta_button')}{' '}</a>
      </div>

    </div>
  </div>
    </PageShell>
  );
}
