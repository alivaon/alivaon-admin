'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Liste de textes (technologies, points forts…) : ajout, suppression, ordre conservé. */
export function ListInput({ id, value, itemLabel, onChange }: { id: string; value: unknown; itemLabel: string; onChange: (value: string[]) => void }) {
  const items = Array.isArray(value) ? value.map(String) : [];

  return (
    <div className="space-y-2" id={id}>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input value={item} aria-label={`${itemLabel} ${index + 1}`} onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))} />
          <Button type="button" variant="ghost" size="icon" aria-label={`Retirer ${itemLabel.toLowerCase()} ${index + 1}`} onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <X />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ''])}>
        <Plus /> Ajouter
      </Button>
    </div>
  );
}

/** Liens sociaux : réseau → URL. */
export function LinksInput({ id, value, keys, onChange }: { id: string; value: unknown; keys?: string[]; onChange: (value: Record<string, string>) => void }) {
  const entries = value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value as Record<string, string>) : [];
  const listId = `${id}-keys`;
  const update = (next: [string, string][]) => onChange(Object.fromEntries(next));

  return (
    <div className="space-y-2" id={id}>
      {keys && (
        <datalist id={listId}>
          {keys.map((key) => (
            <option key={key} value={key} />
          ))}
        </datalist>
      )}
      {entries.map(([key, url], index) => (
        <div key={index} className="flex gap-2">
          <Input
            className="w-40"
            value={key}
            list={keys ? listId : undefined}
            placeholder="Réseau"
            aria-label={`Réseau ${index + 1}`}
            onChange={(e) => update(entries.map(([k, v], i) => (i === index ? [e.target.value, v] : [k, v])))}
          />
          <Input
            type="url"
            value={url}
            placeholder="https://…"
            aria-label={`URL ${index + 1}`}
            onChange={(e) => update(entries.map(([k, v], i) => (i === index ? [k, e.target.value] : [k, v])))}
          />
          <Button type="button" variant="ghost" size="icon" aria-label={`Retirer le lien ${index + 1}`} onClick={() => update(entries.filter((_, i) => i !== index))}>
            <X />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" disabled={entries.some(([key]) => key === '')} onClick={() => update([...entries, ['', '']])}>
        <Plus /> Ajouter un lien
      </Button>
    </div>
  );
}
