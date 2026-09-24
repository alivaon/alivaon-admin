/**
 * Tags de cache des appels à l'API publique Symfony. Liste identique à
 * App\Revalidation\RevalidationTags côté Symfony, qui les invalide à chaque
 * modification de contenu (POST /api/revalidate).
 */
export const CACHE_TAGS = [
  'articles',
  'categories',
  'tags',
  'projects',
  'project-categories',
  'services',
  'team-members',
  'faqs',
  'testimonials',
  'job-offers',
] as const;

export type CacheTag = (typeof CACHE_TAGS)[number];

export function isCacheTag(value: unknown): value is CacheTag {
  return typeof value === 'string' && (CACHE_TAGS as readonly string[]).includes(value);
}
