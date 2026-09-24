import { PageShell } from '@/components/layout/page-shell';
import { asset } from '@/lib/config';
import { path } from '@/i18n/routes';
import { translator, type Locale } from '@/i18n/translator';

/** error/404.html.twig (aucune version alternative : ni hreflang ni sélecteur de langue). */
export function NotFoundPage({ locale, pathname }: { locale: Locale; pathname: string }) {
  const t = translator(locale);

  return (
    <PageShell
      page={{ locale, route: null, alternates: {} }}
      seo={{ pathname, title: t('error.404.title'), description: t('error.404.meta'), robots: 'noindex, nofollow' }}
    >
      <div className="error overflow-hidden">
        <div className="container">
          <div className="row d-flex justify-content-center">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
              <div className="error__thumb">
                <img src={asset('build/images/404.png')} alt="404" />
              </div>
            </div>
          </div>
        </div>
        <div className="error__title">{t('error.404.heading')}</div>
        <div className="container">
          <div className="row d-flex justify-content-center">
            <div className="col-xl-5 col-lg-7">
              <div className="error-content">
                <p className="error-content__text">{t('error.404.text')}</p>
                <div className="error-content__button margin-bottom-30">
                  <a href={path(locale, 'app_home')} className="rr-btn-button4 btn-purple">
                    <span className="text">{t('error.back_home')}</span>
                    <span className="icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <g clipPath="url(#clip0_246_218)">
                          <path d="M22.0004 11C16.6011 11 12.2227 6.07578 12.2227 0" stroke="white" strokeWidth="2" strokeMiterlimit="10" />
                          <path d="M12.2227 22C12.2227 15.9258 16.5997 11 22.0004 11" stroke="white" strokeWidth="2" strokeMiterlimit="10" />
                          <path d="M22.0005 11H0.000488281" stroke="white" strokeWidth="2" strokeMiterlimit="10" />
                        </g>
                      </svg>
                    </span>
                  </a>
                </div>
                <p>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
