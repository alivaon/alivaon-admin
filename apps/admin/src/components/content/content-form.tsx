'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { Field, violationsFor } from '@/components/form/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError } from '@/lib/api';
import { fieldPath, initialState, type FormState } from '@/lib/content/form';
import { slugify } from '@/lib/content/slugify';
import { LOCALES, type ContentItem, type ContentType, type FieldDef, type Locale } from '@/lib/content/types';
import { FieldInput } from './field-input';
import { TranslationPanel } from './translation-panel';

const CONTENT_TAB = 'Contenu (FR / EN)';

function ErrorMark() {
  return (
    <Badge variant="destructive" className="h-4 px-1" title="Cet onglet contient des erreurs">
      !
    </Badge>
  );
}

/**
 * Formulaire d'un contenu traduisible : onglet des langues (comme le
 * TranslationsField d'EasyAdmin) puis les onglets des champs généraux.
 */
export function ContentForm({
  type,
  item,
  error,
  pending,
  actions,
  onSubmit,
}: {
  type: ContentType;
  item?: ContentItem;
  error: unknown;
  pending: boolean;
  actions?: React.ReactNode;
  onSubmit: (state: FormState) => void;
}) {
  const initial = useMemo(() => initialState(type, item), [type, item]);
  const [state, setState] = useState<FormState>(initial);
  const [slugEdited, setSlugEdited] = useState<Record<Locale, boolean>>(() => {
    const edited = {} as Record<Locale, boolean>;
    for (const locale of LOCALES) {
      const values = initial.translations[locale];
      const slug = typeof values.slug === 'string' ? values.slug : '';
      const source = type.slugSource ? values[type.slugSource] : '';
      edited[locale] = slug !== '' && slug !== slugify(typeof source === 'string' ? source : '');
    }
    return edited;
  });
  const dirty = JSON.stringify(state) !== JSON.stringify(initial);

  // Modifications non enregistrées : le navigateur demande confirmation avant de quitter.
  useEffect(() => {
    if (!dirty) {
      return;
    }
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const groups = useMemo(() => {
    const byTab = new Map<string, [string, FieldDef][]>();
    for (const [name, field] of Object.entries(type.fields)) {
      const tab = field.tab ?? 'Informations générales';
      byTab.set(tab, [...(byTab.get(tab) ?? []), [name, field]]);
    }
    return [...byTab.entries()];
  }, [type]);

  const violations = error instanceof ApiError ? error.violations : [];
  const localeHasErrors = (locale: Locale) => violations.some((v) => v.propertyPath.startsWith(`translations[${locale}]`));
  const groupHasErrors = (fields: [string, FieldDef][]) => violations.some((v) => fields.some(([name]) => v.propertyPath === name));
  const known = new Set([...Object.keys(type.fields), ...LOCALES.flatMap((l) => ['isPublished', ...Object.keys(type.translationFields)].map((n) => fieldPath(n, l)))]);
  const unmatched = violations.filter((v) => !known.has(v.propertyPath));

  function setMain(name: string, value: unknown) {
    setState((current) => ({ ...current, main: { ...current.main, [name]: value } }));
  }

  function setTranslation(locale: Locale, name: string, value: unknown) {
    const publishedAtLoad = item?.translations[locale]?.isPublished === true;
    setState((current) => {
      const values = { ...current.translations[locale], [name]: value };
      if (name === type.slugSource && 'slug' in type.translationFields && !publishedAtLoad && !slugEdited[locale]) {
        values.slug = slugify(typeof value === 'string' ? value : '');
      }
      return { ...current, translations: { ...current.translations, [locale]: values } };
    });
    if (name === 'slug') {
      setSlugEdited((current) => ({ ...current, [locale]: value !== '' }));
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(state);
  }

  const translations = (
    <Tabs defaultValue="fr">
      <TabsList>
        {LOCALES.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="gap-2">
            {locale.toUpperCase()}
            <Badge variant={state.translations[locale].isPublished ? 'default' : 'secondary'} className="h-4 px-1.5 text-[10px]">
              {state.translations[locale].isPublished ? 'publiée' : 'brouillon'}
            </Badge>
            {item?.translations[locale]?.isStale && (
              <Badge className="h-4 bg-red-100 px-1.5 text-[10px] text-red-800" title="La version source a été modifiée depuis cette traduction">
                à mettre à jour
              </Badge>
            )}
            {localeHasErrors(locale) && <ErrorMark />}
          </TabsTrigger>
        ))}
      </TabsList>
      {LOCALES.map((locale) => (
        <TabsContent key={locale} value={locale}>
          <TranslationPanel
            type={type}
            locale={locale}
            values={state.translations[locale]}
            loaded={item?.translations[locale]}
            error={error}
            onChange={(name, value) => setTranslation(locale, name, value)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );

  return (
    <form onSubmit={submit} noValidate>
      {unmatched.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {unmatched.map((v) => (
              <p key={`${v.propertyPath}${v.message}`}>{v.message}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent>
          {groups.length === 0 ? (
            translations
          ) : (
            <Tabs defaultValue={CONTENT_TAB}>
              <TabsList variant="line" className="mb-4">
                <TabsTrigger value={CONTENT_TAB} className="gap-2">
                  {CONTENT_TAB}
                  {LOCALES.some(localeHasErrors) && <ErrorMark />}
                </TabsTrigger>
                {groups.map(([tab, fields]) => (
                  <TabsTrigger key={tab} value={tab} className="gap-2">
                    {tab}
                    {groupHasErrors(fields) && <ErrorMark />}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={CONTENT_TAB}>{translations}</TabsContent>
              {groups.map(([tab, fields]) => (
                <TabsContent key={tab} value={tab} className="max-w-3xl space-y-5">
                  {fields.map(([name, field]) => (
                    <Field key={name} label={`${field.label}${field.required ? ' *' : ''}`} htmlFor={`main-${name}`} error={error} path={name} hint={field.help}>
                      <FieldInput id={`main-${name}`} field={field} value={state.main[name]} invalid={violationsFor(error, name).length > 0} onChange={(value) => setMain(name, value)} />
                    </Field>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
      <div className="sticky bottom-0 z-10 -mx-1 mt-4 flex items-center justify-end gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur">
        {dirty && <span className="mr-auto text-sm text-muted-foreground">Modifications non enregistrées</span>}
        {actions}
        <Button type="submit" disabled={pending}>
          <Save /> {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
