/**
 * Filtre |date de Twig (format de date() de PHP) pour les formats utilisés par
 * les gabarits : d, m, Y, M, F, H, i ; tout autre caractère est recopié.
 *
 * Les dates de l'API portent le fuseau du serveur (Europe/Paris en production) :
 * on reprend l'heure telle qu'écrite, sans conversion — comme Twig, qui formate
 * dans ce même fuseau. Mois en anglais, comme date() de PHP (non localisé).
 */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Fuseau du serveur Symfony (date.timezone de production). */
const SERVER_TIMEZONE = process.env.APP_TIMEZONE ?? 'Europe/Paris';

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function partsOf(value: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(value);
  return m ? { year: +m[1], month: +m[2], day: +m[3], hour: +(m[4] ?? 0), minute: +(m[5] ?? 0) } : null;
}

function nowParts(): Parts {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: SERVER_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** value : date ISO de l'API, ou 'now'. Date absente → chaîne vide. */
export function twigDate(value: string | null | undefined, format: string): string {
  const p = value === 'now' ? nowParts() : value ? partsOf(value) : null;
  if (!p) {
    return '';
  }
  let out = '';
  for (let i = 0; i < format.length; i++) {
    const c = format[i];
    if (c === '\\') {
      out += format[++i] ?? '';
      continue;
    }
    out +=
      c === 'd' ? pad(p.day)
      : c === 'm' ? pad(p.month)
      : c === 'Y' ? String(p.year)
      : c === 'M' ? MONTHS[p.month - 1].slice(0, 3)
      : c === 'F' ? MONTHS[p.month - 1]
      : c === 'H' ? pad(p.hour)
      : c === 'i' ? pad(p.minute)
      : c;
  }
  return out;
}
