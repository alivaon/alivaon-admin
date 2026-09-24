import { asset } from '@/lib/config';
import { path } from '@/i18n/routes';
import { translator } from '@/i18n/translator';
import type { PageContext } from './page-context';

/** _partials/_side_toggle.html.twig (menu latéral mobile, rempli par meanmenu) */
export function SideToggle({ page }: { page: PageContext }) {
  const t = translator(page.locale);

  return (
    <>
      <aside className="fix">
        <div className="side-info">
          <div className="side-info-content">
            <div className="offset-widget offset-header">
              <div className="offset-logo">
                <a href={path(page.locale, 'app_home')}>{' '}<img className="show-light" src={asset('build/images/logo/logo.png')} alt="site logo" />{' '}</a>
              </div>
              <button id="side-info-close" className="side-info-close">{' '}<i className="fas fa-times"></i>{' '}</button>
            </div>
            <div className="mobile-menu d-xl-none fix"></div>
            <div className="offset-button">
              <a href={path(page.locale, 'app_contact')} className="rr-btn">{' '}<span className="btn-wrap">{' '}<span className="text-one">{t('side.start')}</span>{' '}<span className="text-two">{t('side.a_project')}</span>{' '}</span>{' '}</a>
            </div>
            <div className="offset-widget-box">
              <h2 className="title">{t('side.contact_us')}</h2>
              <div className="contact-meta">
                <div className="contact-item">
                  <span className="icon">{' '}<i className="fa-solid fa-location-dot"></i>{' '}</span>{' '}<span className="text">Logpom, Douala, Cameroun</span>
                </div>
                <div className="contact-item">
                  <span className="icon">{' '}<i className="fa-solid fa-envelope"></i>{' '}</span>{' '}<span className="text">{' '}<a href="mailto:contact@alivaon.com">contact@alivaon.com</a>{' '}</span>
                </div>
                <div className="contact-item">
                  <span className="icon">{' '}<i className="fa-solid fa-phone"></i>{' '}</span>{' '}<span className="text">{' '}<a href="tel:+237691962158">+237 6 91 96 21 58</a>{' '}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="offcanvas-overlay"></div>
    </>
  );
}

/** _partials/_scroll_top.html.twig */
export function ScrollTop() {
  return (
    <div className="progress-wrap">
      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
        <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
      </svg>
    </div>
  );
}

const DEFAULT_MARQUEE = ['strategy', 'marketing', 'analysis', 'marketing', 'strategy', 'marketing', 'analysis', 'marketing'];

/** _partials/_marquee.html.twig */
export function Marquee({ items = DEFAULT_MARQUEE }: { items?: string[] }) {
  return (
    <div className="marque-section6 rr-ov-hidden">
      <div className="marquee-wrapper text-slider-1">
        <div className="marquee-inner to-left">
          <ul className="marqee-list d-flex">
            <li className="marquee-item">
              {items.map((item, index) => (
                // loop.index commence à 1 : impair = text-slider-1.
                <span key={index} className={index % 2 === 0 ? 'text-slider-1' : 'text-slider-2'}>{' '}{item}{' '}</span>
              ))}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
