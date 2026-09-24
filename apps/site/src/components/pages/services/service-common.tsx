import type { Locale } from '@/i18n/translator';
import { trans } from '@/i18n/translator';

/** ServiceController::PILLAR_ICONS */
export const PILLAR_ICONS: Record<number, string> = {
  1: 'fa-solid fa-gears',
  2: 'fa-solid fa-laptop-code',
  3: 'fa-solid fa-rocket-launch',
  4: 'fa-solid fa-shield-halved',
};

/** ServiceController::pillarDefs() */
export function pillarDef(locale: Locale, pillar: number): { icon: string; title: string; subtitle: string } | null {
  const icon = PILLAR_ICONS[pillar];
  return icon ? { icon, title: trans(locale, `pillar.${pillar}.title`), subtitle: trans(locale, `pillar.${pillar}.subtitle`) } : null;
}

/** Secteurs d'activité (service/index.html.twig). */
export const SECTORS = [
  ['fa-cart-shopping', 'sector.commerce'],
  ['fa-utensils', 'sector.hospitality'],
  ['fa-truck', 'sector.logistics'],
  ['fa-kit-medical', 'sector.health'],
  ['fa-briefcase', 'sector.services'],
  ['fa-building', 'sector.realestate'],
  ['fa-industry', 'sector.industry'],
  ['fa-graduation-cap', 'sector.education'],
  ['fa-coins', 'sector.finance'],
] as const;

/** {% set quote_svg %} */
export function QuoteIcon() {
  return (
    <svg width="138" height="109" viewBox="0 0 138 109" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M58.8991 7.77194L53.8918 0C19.247 23.5085 0 52.0721 0 75.5806C0 98.3119 16.5556 109 30.6044 109C48.3117 109 60.8207 93.8416 60.8207 77.9122C60.8207 64.5072 52.352 53.042 40.9948 48.7644C37.7242 47.5955 34.6447 46.6255 34.6447 40.9923C34.6447 33.8049 39.843 23.1231 58.8991 7.77194ZM135.308 7.77194L130.301 0C96.0383 23.5085 76.4094 52.0721 76.4094 75.5806C76.4094 98.3119 93.3468 109 107.396 109C125.294 109 138 93.8416 138 77.9122C138 64.5072 129.34 53.042 117.595 48.7644C114.325 47.5955 111.436 46.6255 111.436 40.9923C111.436 33.8049 116.825 23.1168 135.302 7.76573L135.308 7.77194Z"
        fill="#36A9E1"
      />
    </svg>
  );
}
