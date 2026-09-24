import { createApiClient } from '@alivaon/api-client';

/**
 * Client de l'API Symfony, appelé depuis le navigateur sur la même origine :
 * Traefik route /api/admin, /api/auth et /uploads vers Symfony. Le cookie de
 * session reste entre le navigateur et Symfony (jamais lu par Next.js).
 * En développement, next.config.ts relaie ces chemins vers Symfony.
 */
export const api = createApiClient({ baseUrl: '' });

export interface Violation {
  propertyPath: string;
  message: string;
}

/** Erreur d'API, avec les violations de validation (422) le cas échéant. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly violations: Violation[] = [],
  ) {
    super(message);
  }
}

interface ApiResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/** Données de la réponse, ou ApiError (message lisible, violations). */
export async function unwrap<T>(call: Promise<ApiResult<T>>): Promise<T> {
  const { data, error, response } = await call;
  if (response.ok) {
    return data as T;
  }
  throw toApiError(response.status, error);
}

export function toApiError(status: number, body: unknown): ApiError {
  const payload = (body ?? {}) as { detail?: string; description?: string; error?: string; message?: string; violations?: Violation[] };
  const message =
    payload.detail ?? payload.description ?? payload.error ?? payload.message ?? (status === 403 ? 'Accès refusé.' : status === 404 ? 'Élément introuvable.' : 'Une erreur est survenue.');

  return new ApiError(message, status, payload.violations ?? []);
}

/** Collections JSON-LD : éléments et total. */
export interface Collection<T> {
  member: T[];
  totalItems: number;
}

type Member<T> = T extends { member: (infer M)[] } ? M : never;

/**
 * Liste paginée. Le client demande du JSON-LD (métadonnées de pagination) ;
 * le type généré couvre aussi la variante JSON (tableau simple).
 */
export async function unwrapCollection<T>(call: Promise<ApiResult<T>>): Promise<Collection<Member<T>>> {
  const data = (await unwrap(call)) as unknown;
  if (Array.isArray(data)) {
    return { member: data, totalItems: data.length };
  }
  const collection = data as { member: Member<T>[]; totalItems?: number };

  return { member: collection.member, totalItems: collection.totalItems ?? collection.member.length };
}

/** Filtre booléen d'URL (« true » / « false » / vide) en paramètre d'API. */
export function booleanParam(value: string | undefined): boolean | undefined {
  return value === 'true' ? true : value === 'false' ? false : undefined;
}

/** Filtre numérique d'URL en paramètre d'API. */
export function integerParam(value: string | undefined): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}
