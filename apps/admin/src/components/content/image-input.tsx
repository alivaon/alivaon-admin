'use client';

import { useRef, useState } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { uploadImage } from '@/lib/content/api';
import type { UploadDirectory } from '@/lib/content/types';

/**
 * Image d'un contenu : envoi immédiat (POST /api/admin/uploads/{dossier}),
 * le nom du fichier renvoyé est enregistré avec le contenu.
 */
export function ImageInput({ id, directory, value, onChange }: { id: string; directory: UploadDirectory; value: unknown; onChange: (fileName: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileName = typeof value === 'string' && value !== '' ? value : null;

  async function upload(file: File) {
    setPending(true);
    setError(null);
    try {
      const result = await uploadImage(directory, file);
      onChange(result.fileName);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Échec de l'envoi.");
    } finally {
      setPending(false);
      if (input.current) {
        input.current.value = '';
      }
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-xs text-muted-foreground">
        {fileName ? (
          // eslint-disable-next-line @next/next/no-img-element -- fichier servi par Symfony (/uploads), pas d'optimisation Next
          <img src={`/uploads/${directory}/${fileName}`} alt="" className="h-full w-full object-cover" />
        ) : (
          'Aucune image'
        )}
      </div>
      <div className="space-y-2">
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void upload(file);
            }
          }}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => input.current?.click()}>
            <ImageUp /> {pending ? 'Envoi…' : fileName ? 'Remplacer' : 'Choisir une image'}
          </Button>
          {fileName && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 /> Retirer
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP, 5 Mo maximum.</p>
        {fileName && <p className="max-w-64 truncate text-xs text-muted-foreground">{fileName}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
