import 'server-only';
import { notFound } from 'next/navigation';
import { createApiClient } from '@alivaon/api-client';
import { API_INTERNAL_URL, SITE_ORIGIN } from './config';
import type { CacheTag } from './cache-tags';

/**
 * API publique de Symfony, appelée par le réseau interne. publicOrigin :
 * les URLs absolues renvoyées (url, alternates) portent le domaine public.
 */
export const api = createApiClient({ baseUrl: API_INTERNAL_URL, publicOrigin: SITE_ORIGIN });

/**
 * fetch mis en cache par Next : invalidé par tag quand Symfony signale une
 * modification (POST /api/revalidate), et au plus tard après une heure
 * (filet de sécurité : échec d'envoi, offre d'emploi qui expire).
 */
export function cached(...tags: CacheTag[]) {
  return (request: Request) => fetch(request, { next: { tags, revalidate: 3600 } });
}

interface ApiResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/** Données de la réponse ; 404 de l'API → page 404 (jamais de repli de langue). */
export async function load<T>(call: Promise<ApiResult<T>>): Promise<T> {
  const { data, response } = await call;
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok || data === undefined) {
    throw new Error(`API publique : ${response.status} ${response.url}`);
  }
  return data;
}

type Member<T> = T extends { member: (infer M)[] } ? M : never;

/** Éléments d'une collection (JSON-LD : member ; variante JSON : tableau). */
export function members<T>(data: T): Member<T>[] {
  const value = data as unknown;
  return (Array.isArray(value) ? value : (value as { member: Member<T>[] }).member) as Member<T>[];
}

/** Métadonnées de pagination d'une collection JSON-LD. */
export function totalItems(data: unknown): number {
  const value = data as { totalItems?: number; member?: unknown[] };
  return value.totalItems ?? value.member?.length ?? 0;
}
