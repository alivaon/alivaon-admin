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
  totalItems?: number;
}
