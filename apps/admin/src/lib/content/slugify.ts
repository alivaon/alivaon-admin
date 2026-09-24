/**
 * Slug dérivé d'un titre : même algorithme que l'écran EasyAdmin
 * (assets/js/admin_translations.js) et que App\Content\Translation\SlugGenerator.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
