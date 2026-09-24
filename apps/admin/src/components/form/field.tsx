'use client';

import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';

/** Messages de validation (422) pour un champ, par chemin exact. */
export function violationsFor(error: unknown, path: string): string[] {
  return error instanceof ApiError ? error.violations.filter((v) => v.propertyPath === path).map((v) => v.message) : [];
}

export function Field({ label, htmlFor, error, path, hint, children }: { label: string; htmlFor: string; error?: unknown; path?: string; hint?: string; children: ReactNode }) {
  const messages = path ? violationsFor(error, path) : [];

  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && messages.length === 0 && <p className="text-xs text-muted-foreground">{hint}</p>}
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </div>
  );
}
