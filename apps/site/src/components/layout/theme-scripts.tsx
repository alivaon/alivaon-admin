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
 * <script> en fin de <body>. Les écouteurs DOMContentLoaded qu'ils posent
 * (sliders de main.js) sont appelés une fois les scripts exécutés. Les pages sont servies en navigation complète
 * (liens <a>, pas de navigation client) : le thème s'initialise une fois par page.
 */
export function ThemeScripts({ scripts }: { scripts: ThemeScript[] }) {
  useEffect(() => {
    if (window.__alivaonTheme) {
      return;
    }
    window.__alivaonTheme = true;

    // Les scripts du thème arrivent après DOMContentLoaded : un écouteur qu'ils
    // posent sur cet événement ne serait jamais appelé. On retient ces seuls
    // écouteurs tardifs et on les appelle une fois les scripts exécutés. Les
    // écouteurs posés pendant l'analyse de la page (scripts en ligne des
    // gabarits) reçoivent l'événement réel une seule fois : pas de rejeu global.
    const late: EventListenerOrEventListenerObject[] = [];
    const addEventListener = document.addEventListener;
    document.addEventListener = function (this: Document, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      if (type === 'DOMContentLoaded' && document.readyState !== 'loading' && listener) {
        late.push(listener);
        return;
      }
      if (listener) addEventListener.call(this, type, listener, options);
    } as typeof document.addEventListener;

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
    const done = () => {
      document.addEventListener = addEventListener;
      const event = new Event('DOMContentLoaded');
      for (const listener of late) {
        if (typeof listener === 'function') listener.call(document, event);
        else listener.handleEvent(event);
      }
    };
    last?.addEventListener('load', done);
    last?.addEventListener('error', done);
  }, [scripts]);

  return null;
}
