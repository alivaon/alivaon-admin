import { asset } from '@/lib/config';
import { path } from '@/i18n/routes';
import { translator } from '@/i18n/translator';
import type { PageContext } from './page-context';

const NAV = [
  ['app_home', 'nav.home'],
  ['app_about', 'nav.about'],
  ['app_service_index', 'nav.services'],
  ['app_portfolio_index', 'nav.portfolio'],
  ['app_blog_index', 'nav.blog'],
  ['app_faq', 'nav.faq'],
  ['app_contact', 'nav.contact'],
] as const;

/** _partials/_header.html.twig */
export function Header({ page, extraClass = '' }: { page: PageContext; extraClass?: string }) {
  const t = translator(page.locale);
  const isHeader7 = extraClass === 'header-area-7';
  const others = Object.entries(page.alternates).filter(([locale]) => locale !== page.locale);

  return (
    <header className={`header-area${extraClass ? ` ${extraClass}` : ''}`}>
      <div className="header-main">
        <div className="container rr-container-1800">
          <div className={isHeader7 ? 'header-area-7__inner' : 'header-area__inner'}>
            <div className="header__logo">
              <a href={path(page.locale, 'app_home')}>{' '}<img src={asset('build/images/logo/logo.png')} className="normal-logo" alt="Site Logo" />{' '}</a>
            </div>
            <div className="header__nav d-none d-xl-block">
              <nav className="main-menu" id="mobile-menu">
                <ul>
                  {NAV.map(([route, label]) => (
                    <li key={route} className={page.route === route ? 'active' : undefined}>
                      <a href={path(page.locale, route)}>{t(label)}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            {Object.keys(page.alternates).length > 1 && (
              <div className="header__lang">
                {others.map(([locale, url]) => (
                  <a key={locale} className="header__lang-link" href={url} hrefLang={locale} aria-label={locale === 'fr' ? 'Version française' : 'English version'}>{' '}<img className="header__lang-flag" src={asset(`build/images/flags/${locale}.svg`)} width={24} height={16} alt="" loading="lazy" />{' '}</a>
                ))}
              </div>
            )}
            <div className="header-right">
              {isHeader7 ? (
                <div className="btn-wrap d-none d-xl-block">
                  <a href={path(page.locale, 'app_contact')} className="rr-btn-button5 btn-dark">{' '}<span className="text">{t('nav.contact_us')}</span>{' '}<span className="icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M22 11C16.6 11 12.2 6.08 12.2 0" stroke="currentColor" strokeWidth="2" />
                        <path d="M12.2 22C12.2 15.93 16.6 11 22 11" stroke="currentColor" strokeWidth="2" />
                        <path d="M22 11H0" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>{' '}</a>
                </div>
              ) : (
                <a href={path(page.locale, 'app_contact')} className="rr-btn-border d-none d-xl-inline-flex">{' '}<span className="text">{t('nav.contact_us')}</span>{' '}<span className="icon">{' '}<i className="fa-regular fa-arrow-right"></i>{' '}</span>{' '}</a>
              )}
              <div className="header__navicon d-xl-none">
                {/* HTML brut : React 19 bloque les URLs javascript: (il les remplacerait
                    par un script qui lève une erreur au clic). */}
                <div className="side-toggle" dangerouslySetInnerHTML={{ __html: '<a class="bar-icon" href="javascript:void(0)"><span></span><span></span></a>' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
