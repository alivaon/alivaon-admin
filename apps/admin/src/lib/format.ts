import type { components } from '@alivaon/api-client';

export type ApplicationStatus = components['schemas']['AdminCandidateApplication.ApplicationStatusInput']['status'];

/**
 * Formats d'affichage du back-office (français). Les dates de l'API portent le
 * fuseau du serveur (Europe/Paris en production) : on affiche cette heure
 * telle quelle, sans conversion vers le fuseau du navigateur, comme EasyAdmin
 * et comme les champs de saisie des formulaires.
 */
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

export function formatDate(value: string | null | undefined): string {
  const m = value ? ISO.exec(value) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '—';
}

export function formatDateTime(value: string | null | undefined): string {
  const m = value ? ISO.exec(value) : null;
  if (!m) {
    return '—';
  }
  return m[4] ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : `${m[3]}/${m[2]}/${m[1]}`;
}

/** Couleurs des statuts de candidature (mêmes teintes que le tableau de bord EasyAdmin). */
export const APPLICATION_STATUS_CLASSES: Record<string, string> = {
  reçue: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-amber-100 text-amber-800',
  entretien: 'bg-violet-100 text-violet-800',
  refusée: 'bg-red-100 text-red-800',
  acceptée: 'bg-green-100 text-green-800',
};

/** Statuts de candidature (CandidateApplication::STATUS_LABELS). */
export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'reçue', label: 'Reçue' },
  { value: 'en_cours', label: "En cours d'examen" },
  { value: 'entretien', label: 'Entretien' },
  { value: 'refusée', label: 'Refusée' },
  { value: 'acceptée', label: 'Acceptée' },
];
