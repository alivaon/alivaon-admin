'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';
import { isAdmin, useLogout, type CurrentUser } from '@/lib/auth';
import { NAVIGATION } from '@/lib/navigation';

function Logo() {
  return (
    <Link href="/" className="block w-fit">
      {/* eslint-disable-next-line @next/next/no-img-element -- logo du site (131×45), pas d'optimisation utile */}
      <img src="/logo.png" alt="Alivaon" width={131} height={45} className="block h-8 w-auto" />
    </Link>
  );
}

/** Navigation et compte : barre latérale (écran large) et tiroir (mobile). */
function Sidebar({ user, onNavigate }: { user: NonNullable<CurrentUser>; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const admin = isAdmin(user);

  return (
    <>
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
                        onClick={onNavigate}
                        className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted', active && 'bg-muted font-medium')}
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
        <div className="flex items-center gap-2 px-2 pb-1">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate font-medium">{user.fullName ?? user.email}</p>
            <p className="text-xs text-muted-foreground">{admin ? 'Administrateur' : 'Éditeur'}</p>
          </div>
        </div>
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
    </>
  );
}

export function AppShell({ user, children }: { user: NonNullable<CurrentUser>; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r bg-background md:flex">
        <div className="px-5 py-4">
          <Logo />
        </div>
        <Sidebar user={user} />
      </aside>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background px-4 py-2 md:hidden">
          <Logo />
          <DialogPrimitive.Trigger render={<Button variant="ghost" size="icon" aria-label="Ouvrir le menu" />}>
            <Menu />
          </DialogPrimitive.Trigger>
        </header>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 md:hidden" />
          <DialogPrimitive.Popup
            aria-label="Menu"
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r bg-background shadow-lg outline-none md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <Logo />
              <DialogPrimitive.Close render={<Button variant="ghost" size="icon" aria-label="Fermer le menu" />}>
                <X />
              </DialogPrimitive.Close>
            </div>
            <Sidebar user={user} onNavigate={() => setMenuOpen(false)} />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
