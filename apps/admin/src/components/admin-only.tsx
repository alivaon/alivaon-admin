'use client';

import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isAdmin, useCurrentUser } from '@/lib/auth';

/** Écran réservé aux administrateurs (Symfony refuse de toute façon : 403). */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();

  if (!isAdmin(user)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Accès réservé aux administrateurs.</AlertDescription>
      </Alert>
    );
  }

  return children;
}
