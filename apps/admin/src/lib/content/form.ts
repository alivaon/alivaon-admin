import { LOCALES, type ContentItem, type ContentType, type FieldDef, type Locale, type TranslationValues } from './types';

export type Values = Record<string, unknown>;

export interface FormState {
  main: Values;
  translations: Record<Locale, Values>;
}

function emptyValue(field: FieldDef): unknown {
  switch (field.kind) {
    case 'switch':
      return false;
    case 'relation':
      return field.many ? [] : null;
    case 'text':
    case 'email':
    case 'url':
    case 'textarea':
    case 'richtext':
      return field.required ? '' : null;
    default:
      return null;
  }
}

function pick(fields: Record<string, FieldDef>, source: Values | undefined, defaults: Values = {}): Values {
  return Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, source && name in source ? source[name] : name in defaults ? defaults[name] : emptyValue(field)]),
  );
}

/**
 * État du formulaire. Nouveau contenu : valeurs par défaut des entités ;
 * les deux langues existent toujours (TranslationInitializer côté Symfony).
 */
export function initialState(type: ContentType, item?: ContentItem): FormState {
  const translations = {} as Record<Locale, Values>;
  for (const locale of LOCALES) {
    const source = item?.translations[locale];
    translations[locale] = { ...pick(type.translationFields, source), isPublished: source?.isPublished ?? false };
  }

  return { main: pick(type.fields, item, type.defaults as Values), translations };
}

/** Valeur envoyée à l'API : chaînes et listes vides des champs facultatifs → null. */
function normalize(field: FieldDef, value: unknown): unknown {
  if (typeof value === 'string') {
    return value === '' && !field.required ? null : value;
  }
  if ((field.kind === 'list' && Array.isArray(value) && value.length === 0) || (field.kind === 'links' && value && Object.keys(value).length === 0)) {
    return null;
  }
  return value;
}

function normalizeAll(fields: Record<string, FieldDef>, values: Values): Values {
  return Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, normalize(field, values[name])]));
}

/** Corps complet d'un POST / PUT (remplacement : tous les champs). */
export function toPayload(type: ContentType, state: FormState): Values {
  return {
    ...normalizeAll(type.fields, state.main),
    translations: Object.fromEntries(
      LOCALES.map((locale) => [locale, { ...normalizeAll(type.translationFields, state.translations[locale]), isPublished: state.translations[locale].isPublished }]),
    ),
  };
}

/** Libellé d'un contenu (listes, titre de la fiche). */
export function itemLabel(type: ContentType, item: ContentItem): string {
  const main = type.mainLabelField ? item[type.mainLabelField] : null;
  const translated = item.translations.fr?.[type.labelField];
  const label = typeof main === 'string' && main !== '' ? main : typeof translated === 'string' ? translated : '';

  return label !== '' ? label : `${type.singular} #${item.id}`;
}

export type TranslationStatus = 'missing' | 'draft' | 'stale' | 'fresh';

/** État d'une traduction, comme la colonne « Traduction EN » d'EasyAdmin. */
export function translationStatus(translation: TranslationValues | undefined): TranslationStatus {
  if (!translation) {
    return 'missing';
  }
  if (!translation.isPublished) {
    return 'draft';
  }
  return translation.isStale ? 'stale' : 'fresh';
}

export const TRANSLATION_STATUS: Record<TranslationStatus, { label: string; title: string; className: string }> = {
  missing: { label: 'Absente', title: 'Aucune traduction EN', className: 'bg-muted text-muted-foreground' },
  draft: { label: 'Brouillon', title: 'Traduction EN non publiée', className: 'bg-amber-100 text-amber-800' },
  stale: { label: 'À mettre à jour', title: 'La version source a été modifiée depuis cette traduction', className: 'bg-red-100 text-red-800' },
  fresh: { label: 'À jour', title: 'Traduction EN publiée et alignée sur la source', className: 'bg-green-100 text-green-800' },
};

/** Chemins de violation d'un champ : « author », « translations[en].content ». */
export function fieldPath(name: string, locale?: Locale): string {
  return locale ? `translations[${locale}].${name}` : name;
}
