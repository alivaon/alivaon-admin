'use client';

import { useEffect } from 'react';

export type ThemeScript = { src: string } | { inline: string };

declare global {
  interface Window {
    __alivaonTheme?: boolean;
  }
}

/**
 * Scripts du thème jQuery (GSAP, Swiper, WOW, meanmenu…), dans l'ordre exact
 * de base.html.twig. Ils modifient le DOM (menu mobile cloné, titres découpés,
 * défilement fluide) : ils ne doivent s'exécuter qu'APRÈS l'hydratation de
 * React, sinon React reconstruirait la page et effacerait leurs effets.
 *
 * Insérés avec async=false : exécution dans l'ordre d'insertion, comme des
 * <script> en fin de <body>. Les pages sont servies en navigation complète
 * (liens <a>, pas de navigation client) : le thème s'initialise une fois par page.
 */
export function ThemeScripts({ scripts }: { scripts: ThemeScript[] }) {
  useEffect(() => {
    if (window.__alivaonTheme) {
      return;
    }
    window.__alivaonTheme = true;

    let last: HTMLScriptElement | null = null;
    for (const script of scripts) {
      const element = document.createElement('script');
      // Un script en ligne inséré s'exécuterait tout de suite, avant les
      // fichiers qui le précèdent : on le sert en blob pour garder l'ordre.
      element.src = 'src' in script ? script.src : URL.createObjectURL(new Blob([script.inline], { type: 'text/javascript' }));
      element.async = false;
      document.body.appendChild(element);
      last = element;
    }
    // Écouteurs DOMContentLoaded posés par main.js (sliders) : l'événement
    // est déjà passé quand les scripts arrivent après l'hydratation.
    last?.addEventListener('load', () => document.dispatchEvent(new Event('DOMContentLoaded')));
  }, [scripts]);

  return null;
}
