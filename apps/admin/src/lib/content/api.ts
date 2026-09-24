import { toApiError, type Collection } from '@/lib/api';
import type { ContentItem, ContentType, RelationKey, UploadDirectory } from './types';

/**
 * Appels génériques aux contenus traduisibles (/api/admin/{type}) : les
 * 11 types partagent les mêmes opérations (ContentProvider / ContentProcessor).
 */
async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { Accept: 'application/ld+json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiError(response.status, data);
  }
  return data as T;
}

export function listContent(type: ContentType, query: Record<string, string | number | undefined>): Promise<Collection<ContentItem>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return request<{ member: ContentItem[]; totalItems?: number }>('GET', `${type.endpoint}?${params}`).then((data) => ({
    member: data.member,
    totalItems: data.totalItems ?? data.member.length,
  }));
}

export const getContent = (type: ContentType, id: number | string) => request<ContentItem>('GET', `${type.endpoint}/${id}`);
export const createContent = (type: ContentType, body: unknown) => request<ContentItem>('POST', type.endpoint, body);
export const updateContent = (type: ContentType, id: number | string, body: unknown) => request<ContentItem>('PUT', `${type.endpoint}/${id}`, body);
export const deleteContent = (type: ContentType, id: number | string) => request<null>('DELETE', `${type.endpoint}/${id}`);

const RELATION_ENDPOINTS: Record<RelationKey, string> = {
  authors: '/api/admin/authors',
  categories: '/api/admin/categories',
  tags: '/api/admin/tags',
  'project-categories': '/api/admin/project-categories',
};

/** Tous les éléments d'une relation (nom français), toutes pages confondues. */
export async function listRelationOptions(relation: RelationKey): Promise<{ value: number; label: string }[]> {
  const options: { value: number; label: string }[] = [];
  for (let page = 1; ; page++) {
    const data = await request<{ member: ContentItem[]; totalItems?: number }>('GET', `${RELATION_ENDPOINTS[relation]}?itemsPerPage=100&page=${page}`);
    for (const item of data.member) {
      const name = item.translations.fr?.name;
      options.push({ value: item.id, label: typeof name === 'string' && name !== '' ? name : `#${item.id}` });
    }
    if (data.member.length === 0 || options.length >= (data.totalItems ?? 0)) {
      return options.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    }
  }
}

/** Envoi d'une image : POST /api/admin/uploads/{dossier} (JPEG, PNG, WebP, 5 Mio). */
export async function uploadImage(directory: UploadDirectory, file: File): Promise<{ fileName: string; url: string }> {
  const data = new FormData();
  data.append('file', file);
  const response = await fetch(`/api/admin/uploads/${directory}`, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiError(response.status, body);
  }
  return body as { fileName: string; url: string };
}
