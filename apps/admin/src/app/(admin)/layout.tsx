'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/lib/auth';

/**
 * Espace connecté : sans session valide, renvoi vers la connexion. La vraie
 * protection reste côté Symfony (pare-feu api_admin, rôles par opération) :
 * ce garde ne fait qu'éviter d'afficher des écrans vides.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, user, pathname, router]);

  if (!user) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
