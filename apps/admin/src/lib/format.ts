/** Formats d'affichage du back-office (français). */
const DATE = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DATE_TIME = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function formatDate(value: string | null | undefined): string {
  return value ? DATE.format(new Date(value)) : '—';
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? DATE_TIME.format(new Date(value)) : '—';
}

/** Couleurs des statuts de candidature (mêmes teintes que le tableau de bord EasyAdmin). */
export const APPLICATION_STATUS_CLASSES: Record<string, string> = {
  reçue: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-amber-100 text-amber-800',
  entretien: 'bg-violet-100 text-violet-800',
  refusée: 'bg-red-100 text-red-800',
  acceptée: 'bg-green-100 text-green-800',
};
