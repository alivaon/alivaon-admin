'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode } from 'react';
import { ExternalLink, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { isAdmin, useLogout, type CurrentUser } from '@/lib/auth';
import { NAVIGATION } from '@/lib/navigation';

export function AppShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const admin = isAdmin(user);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r bg-background md:flex">
        <div className="px-5 py-4 text-lg font-semibold">Alivaon</div>
        <nav className="flex-1 space-y-4 px-3 pb-4">
          {NAVIGATION.map((section) => {
            const items = section.items.filter((item) => (!item.adminOnly || admin) && (!item.editorOnly || !admin));
            if (items.length === 0) {
              return null;
            }
            return (
              <div key={section.title ?? 'accueil'}>
                {section.title && <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{section.title}</p>}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted',
                            active && 'bg-muted font-medium',
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <Separator />
        <div className="space-y-1 p-3 text-sm">
          <p className="truncate px-2 font-medium">{user.fullName ?? user.email}</p>
          <p className="px-2 text-xs text-muted-foreground">{admin ? 'Administrateur' : 'Éditeur'}</p>
          <a href="https://www.alivaon.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <ExternalLink className="size-4" /> Voir le site
          </a>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => router.replace('/login') })}
          >
            <LogOut className="size-4" /> Se déconnecter
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
