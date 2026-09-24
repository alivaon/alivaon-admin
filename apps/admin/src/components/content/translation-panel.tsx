'use client';

import { TriangleAlert } from 'lucide-react';
import { Field, violationsFor } from '@/components/form/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { fieldPath, type Values } from '@/lib/content/form';
import type { ContentType, Locale, TranslationValues } from '@/lib/content/types';
import { formatDateTime } from '@/lib/format';
import { FieldInput } from './field-input';

/**
 * Une langue d'un contenu. Le slug suit le titre tant que la traduction n'était
 * pas publiée au chargement et qu'il n'a pas été saisi à la main ; une fois
 * publiée, le modifier affiche l'avertissement d'EasyAdmin (URL indexée).
 */
export function TranslationPanel({
  type,
  locale,
  values,
  loaded,
  error,
  onChange,
}: {
  type: ContentType;
  locale: Locale;
  values: Values;
  /** Traduction telle qu'enregistrée (absente : nouvelle traduction). */
  loaded: TranslationValues | undefined;
  error: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  const publishedAtLoad = loaded?.isPublished === true;
  const slugChanged = publishedAtLoad && 'slug' in type.translationFields && (values.slug ?? '') !== (loaded?.slug ?? '');

  return (
    <div className="space-y-5 pt-2">
      {loaded?.isStale && (
        <Alert>
          <TriangleAlert />
          <AlertDescription>
            La version française a été modifiée depuis la dernière mise à jour de cette traduction ({formatDateTime(loaded.updatedAt)}).
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-3">
          <Switch checked={values.isPublished === true} onCheckedChange={(checked) => onChange('isPublished', checked)} aria-label={`${type.published.label} (${locale.toUpperCase()})`} />
          {type.published.label}
        </Label>
        {type.published.help && <p className="text-xs text-muted-foreground">{type.published.help}</p>}
        {violationsFor(error, fieldPath('isPublished', locale)).map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>
      {Object.entries(type.translationFields).map(([name, field]) => {
        const id = `${locale}-${name}`;
        const path = fieldPath(name, locale);
        return (
          <Field key={name} label={`${field.label}${field.required ? ' *' : ''}`} htmlFor={id} error={error} path={path} hint={field.help}>
            <FieldInput id={id} field={field} value={values[name]} invalid={violationsFor(error, path).length > 0} onChange={(value) => onChange(name, value)} />
            {name === 'slug' && slugChanged && (
              <p role="alert" className="text-xs font-medium text-amber-700">
                ⚠ Cette traduction est déjà publiée : modifier son slug casse l’URL indexée (404, liens perdus). Ne continuez que si une redirection est prévue.
              </p>
            )}
          </Field>
        );
      })}
    </div>
  );
}
