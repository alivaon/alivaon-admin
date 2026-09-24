import { path } from '@/i18n/routes';
import { translator } from '@/i18n/translator';
import type { PageContext } from './page-context';

/** _partials/_footer.html.twig */
export function Footer({ page }: { page: PageContext }) {
  const t = translator(page.locale);
  const link = (route: Parameters<typeof path>[1], label: string) => (
    <a className="footer-area4-widget__nav-link" href={path(page.locale, route)}>
      {t(label)}
    </a>
  );

  return (
    <footer className="footer-area4 rr-ov-hidden">
      <div className="container rr-container-1600">
        <div className="footer-area4-main">
          <div className="row g-5 d-flex justify-content-center justify-content-between">
            <div className="col-xl-4 col-md-6 wow fadeInUp" data-wow-delay=".3s">
              <div className="footer-area4-widget">
                <div className="footer-area4-widget__title">{t('footer.about_title')}</div>
                <p className="footer-area4-widget__text">{t('footer.about_text')}</p>
                <div className="footer-area4-widget__social">
                  <div className="footer-area4-widget__social-link">
                    <a href="https://www.facebook.com/alivaon">
                      <span>
                        <i className="fa-brands fa-facebook-f"></i>
                      </span>
                    </a>
                    <a href="https://x.com/alivaon">
                      <span>
                        <i className="fa-brands fa-x-twitter"></i>
                      </span>
                    </a>
                    <a href="https://www.linkedin.com/company/alivaon/">
                      <span>
                        <i className="fa-brands fa-linkedin-in"></i>
                      </span>
                    </a>
                    <a href="https://www.instagram.com/alivaon.io/">
                      <span>
                        <i className="fa-brands fa-instagram"></i>
                      </span>
                    </a>
                    <a href="https://www.tiktok.com/@alivaon.io">
                      <span>
                        <i className="fa-brands fa-tiktok"></i>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-2 col-md-6 wow fadeInUp" data-wow-delay=".5s">
              <div className="footer-area4-widget">
                <div className="footer-area4-widget__title">{t('footer.quick_links')}</div>
                <div className="footer-area4-widget__nav">
                  {link('app_about', 'nav.about_short')}
                  {link('app_contact', 'nav.contact')}
                  {link('app_portfolio_index', 'nav.portfolio')}
                  {link('app_blog_index', 'nav.blog')}
                  {link('app_service_index', 'nav.services')}
                </div>
              </div>
            </div>
            <div className="col-xl-2 col-md-6 wow fadeInUp" data-wow-delay=".7s">
              <div className="footer-area4-widget">
                <div className="footer-area4-widget__title">{t('footer.resources')}</div>
                <div className="footer-area4-widget__nav">
                  {link('app_faq', 'nav.faq')}
                  {link('app_carriere_index', 'nav.careers')}
                  {link('app_team_index', 'nav.team')}
                  {link('app_mentions_legales', 'nav.legal')}
                  {link('app_politique_confidentialite', 'nav.privacy')}
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 wow fadeInUp" data-wow-delay=".7s">
              <div className="footer-area4-widget">
                <div className="footer-area4-widget__title">{t('footer.newsletter_title')}</div>
                <div className="footer-area4-widget__newsletter">
                  <form action="#" className="footer-area4-widget__newsletter-box">
                    <input type="email" name="email" id="emails" placeholder={t('footer.newsletter_placeholder')} />
                    <button>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </form>
                </div>
                <div className="footer-area4-widget mt-3">
                  <a href="#" className="rr-btn-2 btn-purple">
                    <span className="btn-wrap">
                      <span className="text-one">{t('footer.subscribe')}</span>
                      <span className="text-two">{t('footer.subscribe')}</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-area4-bottom">
        <div className="container">
          <div className="row g-5 d-flex align-items-center justify-content-center">
            <div className="col-xl-11">
              <div className="footer-area4-bottom__wrapper">
                <div className="footer-area4-bottom__copyright text-center wow fadeInLeft" data-wow-delay=".9s">
                  Copyright &copy; {new Date().getFullYear()} Alivaon, {t('footer.rights')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
