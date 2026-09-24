import { API_INTERNAL_URL } from './config';

/**
 * Ressources du thème : fichiers Encore de Symfony (/build, empreinte dans le
 * nom en production) et bibliothèques de /vandor, servis par Symfony aux
 * mêmes URLs que le site Twig (routage Traefik). Le site Next référence
 * exactement les mêmes fichiers : mêmes octets, mêmes URLs.
 */
interface Entrypoints {
  entrypoints: Record<string, { js?: string[]; css?: string[] }>;
}

export async function encoreEntry(name: string): Promise<{ js: string[]; css: string[] }> {
  const response = await fetch(`${API_INTERNAL_URL}/build/entrypoints.json`, { next: { revalidate: 300, tags: ['theme'] } });
  if (!response.ok) {
    throw new Error(`entrypoints.json indisponible (${response.status})`);
  }
  const data = (await response.json()) as Entrypoints;
  const entry = data.entrypoints[name];

  return { js: entry?.js ?? [], css: entry?.css ?? [] };
}

/** Feuilles de style tierces, dans l'ordre de base.html.twig. */
export const VENDOR_CSS = [
  'vandor/bootstrap/bootstrap.min.css',
  'vandor/fontawesome/fontawesome-pro.min.css',
  'vandor/swiper/swiper-bundle.min.css',
  'vandor/menu/meanmenu.min.css',
  'vandor/popup/magnific-popup.css',
  'vandor/nice-select/nice-select.css',
  'vandor/wow/animate.css',
  'vandor/odometer/odometer-theme-default.css',
];

/** Scripts tiers, dans l'ordre de base.html.twig (avant le bundle Encore). */
export const VENDOR_JS = [
  'vandor/jquery/jquery.js',
  'vandor/bootstrap/bootstrap.bundle.min.js',
  'vandor/popup/jquery.magnific-popup.min.js',
  'vandor/swiper/swiper-bundle.min.js',
  'vandor/gsap/gsap.min.js',
  'vandor/gsap/ScrollSmoother.min.js',
  'vandor/gsap/ScrollTrigger.min.js',
  'vandor/gsap/SplitText.min.js',
  'vandor/gsap/SplitType.js',
  'vandor/gsap/customEase.js',
];

/** Après la configuration inline d'Odometer. */
export const VENDOR_JS_AFTER_ODOMETER = [
  'vandor/odometer/odometer.min.js',
  'vandor/odometer/waypoints.min.js',
  'vandor/menu/jquery.meanmenu.min.js',
  'vandor/backtop/backToTop.js',
  'vandor/nice-select/nice-select.js',
  'vandor/wow/wow.min.js',
  'vandor/common-js/common.js',
  'vandor/magiccursor/magiccursor.js',
];

export const MAIN_JS = 'vandor/common-js/main.js';
