import type { components } from '@alivaon/api-client';

export type Schemas = components['schemas'];

export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Dossiers acceptés par POST /api/admin/uploads/{dossier}. */
export type UploadDirectory = 'articles' | 'authors' | 'projects' | 'services' | 'team' | 'testimonials' | 'job_covers' | 'content';

/** Contenus proposés dans les listes de choix des relations (id + nom français). */
export type RelationKey = 'authors' | 'categories' | 'tags' | 'project-categories';

export interface Option {
  value: string | number;
  label: string;
}

/**
 * Champ d'un formulaire de contenu. Libellés et aides : ceux des écrans
 * EasyAdmin (contrôleurs CRUD et FormTypes de traduction).
 */
export type FieldDef = {
  label: string;
  help?: string;
  /** Obligatoire côté entité : reste une chaîne vide au lieu de null. */
  required?: boolean;
  /** Onglet (champs généraux uniquement). */
  tab?: string;
} & (
  | { kind: 'text' | 'email' | 'url' }
  | { kind: 'textarea'; rows?: number }
  | { kind: 'richtext' }
  | { kind: 'number'; min?: number; max?: number; nullable?: boolean }
  | { kind: 'date' | 'datetime' }
  | { kind: 'switch' }
  | { kind: 'list'; itemLabel: string }
  | { kind: 'links'; keys?: string[] }
  | { kind: 'select'; options: Option[]; placeholder?: string }
  | { kind: 'relation'; relation: RelationKey; many?: boolean; placeholder?: string }
  | { kind: 'image'; directory: UploadDirectory }
);

/**
 * Chaque champ inscriptible de l'API doit être décrit (contrôlé à la
 * compilation) : un PUT remplace tout le contenu, un champ oublié serait
 * remis à sa valeur par défaut.
 */
type MainFields<W> = { [K in Exclude<keyof W, 'translations'>]-?: FieldDef };
type TranslationFields<T> = { [K in Exclude<keyof T, 'isPublished'>]-?: FieldDef };

export type Column =
  | { label: string; kind: 'label' | 'en-status' }
  | { label: string; kind: 'text' | 'boolean' | 'datetime' | 'number'; field: string }
  | { label: string; kind: 'translated'; field: string }
  | { label: string; kind: 'relation'; field: string; relation: RelationKey };

export interface ContentType<W = Record<string, unknown>, T = Record<string, unknown>> {
  /** Segment d'URL de l'admin (/articles…). */
  slug: string;
  /** Collection de l'API (/api/admin/…). */
  endpoint: string;
  title: string;
  description: string;
  newLabel: string;
  /** Genre du nom, pour les messages (« Article enregistré », « Offre enregistrée »). */
  feminine?: boolean;
  singular: string;
  /** Champ de traduction affiché et cherché (definition()->labelField). */
  labelField: keyof T & string;
  /** Libellé de la fiche quand il ne vient pas de la traduction (nom du membre, du client). */
  mainLabelField?: keyof W & string;
  /** Champ dont le slug est dérivé (null : pas de slug). */
  slugSource: (keyof T & string) | null;
  columns: Column[];
  booleanFilters: { field: string; label: string; yes: string; no: string }[];
  fields: MainFields<W>;
  /** Valeurs d'un nouveau contenu (défauts des entités). */
  defaults: Partial<Record<Exclude<keyof W, 'translations'>, unknown>>;
  translationFields: TranslationFields<T>;
  published: { label: string; help?: string };
}

/** Identité typée : vérifie la description contre les schémas de l'API. */
export function defineContentType<W, T>(type: ContentType<W, T>): ContentType {
  return type as unknown as ContentType;
}

export type TranslationValues = Record<string, unknown> & { isPublished: boolean; isStale?: boolean; updatedAt?: string | null };

/** Contenu tel que renvoyé par l'API (lecture). */
export interface ContentItem {
  id: number;
  translations: Partial<Record<Locale, TranslationValues>>;
  [field: string]: unknown;
}
