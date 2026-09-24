'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/list/filter-bar';
import { listRelationOptions } from '@/lib/content/api';
import type { FieldDef, RelationKey } from '@/lib/content/types';
import { ImageInput } from './image-input';
import { LinksInput, ListInput } from './list-input';

const RichTextEditor = dynamic(() => import('./rich-text-editor'), { ssr: false, loading: () => <Skeleton className="h-96 w-full" /> });

export function useRelationOptions(relation: RelationKey | undefined) {
  return useQuery({
    queryKey: ['relation-options', relation],
    queryFn: () => listRelationOptions(relation as RelationKey),
    enabled: relation !== undefined,
    staleTime: 60_000,
  });
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/*
 * Dates : l'API les renvoie dans le fuseau du serveur (« 2026-07-29T09:12:00+02:00 »).
 * Le champ affiche l'heure telle quelle et renvoie une heure sans fuseau,
 * interprétée par Symfony dans ce même fuseau : aucune conversion par le
 * navigateur, comme le formulaire EasyAdmin.
 */
const dateTimeValue = (value: unknown) => text(value).slice(0, 16);
const dateValue = (value: unknown) => text(value).slice(0, 10);

function RelationInput({ id, field, value, onChange }: { id: string; field: Extract<FieldDef, { kind: 'relation' }>; value: unknown; onChange: (value: unknown) => void }) {
  const { data: options, isPending } = useRelationOptions(field.relation);

  if (isPending) {
    return <Skeleton className="h-8 w-full" />;
  }
  if (field.many) {
    const selected = Array.isArray(value) ? (value as number[]) : [];
    return (
      <div id={id} className="flex max-h-56 flex-wrap gap-x-5 gap-y-2 overflow-y-auto rounded-lg border p-3">
        {options?.length === 0 && <span className="text-sm text-muted-foreground">Aucun élément.</span>}
        {options?.map((option) => (
          <Label key={option.value} className="font-normal">
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => onChange(checked ? [...selected, option.value] : selected.filter((v) => v !== option.value))}
            />
            {option.label}
          </Label>
        ))}
      </div>
    );
  }

  return (
    <NativeSelect id={id} className="w-full" value={value === null || value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">{field.placeholder ?? '—'}</option>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </NativeSelect>
  );
}

export function FieldInput({ id, field, value, onChange, invalid }: { id: string; field: FieldDef; value: unknown; onChange: (value: unknown) => void; invalid?: boolean }) {
  const common = { id, 'aria-invalid': invalid || undefined };

  switch (field.kind) {
    case 'text':
    case 'email':
    case 'url':
      return <Input {...common} type={field.kind} value={text(value)} onChange={(e) => onChange(e.target.value)} />;
    case 'textarea':
      return <Textarea {...common} rows={field.rows ?? 3} value={text(value)} onChange={(e) => onChange(e.target.value)} />;
    case 'richtext':
      return <RichTextEditor id={id} value={text(value)} onChange={onChange} />;
    case 'number':
      return (
        <Input
          {...common}
          type="number"
          className="w-40"
          min={field.min}
          max={field.max}
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? (field.nullable ? null : 0) : Number(e.target.value))}
        />
      );
    case 'datetime':
      return <Input {...common} type="datetime-local" className="w-60" value={dateTimeValue(value)} onChange={(e) => onChange(e.target.value ? `${e.target.value}:00` : null)} />;
    case 'date':
      return <Input {...common} type="date" className="w-48" value={dateValue(value)} onChange={(e) => onChange(e.target.value || null)} />;
    case 'switch':
      return <Switch id={id} checked={value === true} onCheckedChange={(checked) => onChange(checked)} />;
    case 'select': {
      const numeric = typeof field.options[0]?.value === 'number';
      return (
        <NativeSelect
          {...common}
          className="w-full max-w-md"
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : numeric ? Number(e.target.value) : e.target.value)}
        >
          {field.placeholder !== undefined && <option value="">{field.placeholder}</option>}
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      );
    }
    case 'relation':
      return <RelationInput id={id} field={field} value={value} onChange={onChange} />;
    case 'list':
      return <ListInput id={id} value={value} itemLabel={field.itemLabel} onChange={onChange} />;
    case 'links':
      return <LinksInput id={id} value={value} keys={field.keys} onChange={onChange} />;
    case 'image':
      return <ImageInput id={id} directory={field.directory} value={value} onChange={onChange} />;
  }
}
