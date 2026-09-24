'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, unwrap } from '@/lib/api';
import { APPLICATION_STATUS_CLASSES, formatDate } from '@/lib/format';
import { CONTENT_PATHS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const KPIS: { key: string; label: string; hint: string; href: string }[] = [
  { key: 'articlesPublished', label: 'Articles publiés', hint: 'Blog', href: '/articles' },
  { key: 'projectsTotal', label: 'Projets', hint: 'Portfolio client', href: '/projets' },
  { key: 'servicesTotal', label: 'Services', hint: 'Offres proposées', href: '/services' },
  { key: 'messagesUnread', label: 'Messages non lus', hint: 'Formulaire de contact', href: '/messages' },
  { key: 'jobOffersActive', label: 'Offres actives', hint: 'Offres publiées', href: '/offres' },
  { key: 'candidaturesTotal', label: 'Candidatures', hint: "dont aujourd'hui : ", href: '/candidatures' },
  { key: 'testimonialsTotal', label: 'Témoignages', hint: 'Avis clients', href: '/temoignages' },
  { key: 'teamMembersTotal', label: 'Membres équipe', hint: 'Équipe Alivaon', href: '/equipe' },
];

export default function DashboardPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => unwrap(api.GET('/api/admin/dashboard')),
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <PageHeader title="Vue d'ensemble" description="Activité du site et suivi des contenus." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Link key={kpi.key} href={kpi.href}>
            <Card className="transition hover:shadow-md">
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-3xl">{isPending ? <Skeleton className="h-9 w-16" /> : (data?.kpis[kpi.key] ?? 0)}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {kpi.key === 'candidaturesTotal' ? `${kpi.hint}${data?.kpis.candidaturesToday ?? 0}` : kpi.hint}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Activité &amp; tendances — 6 derniers mois</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Candidatures</CardTitle>
          </CardHeader>
          <CardContent>{data ? <ActivityChart {...data.charts.applications} color="#6366f1" /> : <Skeleton className="h-56" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages contact</CardTitle>
          </CardHeader>
          <CardContent>{data ? <ActivityChart {...data.charts.messages} color="#0ea5e9" /> : <Skeleton className="h-56" />}</CardContent>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Activité récente</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <RecentCard title="Dernières candidatures" href="/candidatures" empty="Aucune candidature pour le moment." isPending={isPending}>
          {data && data.recentApplications.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentApplications.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/candidatures/${a.id}`} className="font-medium hover:underline">
                        {a.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.jobTitle ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-normal', APPLICATION_STATUS_CLASSES[a.status])} variant="secondary">
                        {a.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(a.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </RecentCard>

        <RecentCard title="Derniers messages" href="/messages" empty="Aucun message reçu pour le moment." isPending={isPending}>
          {data && data.recentMessages.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expéditeur</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentMessages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={`/messages/${m.id}`} className={cn('inline-flex items-center gap-2 hover:underline', !m.isRead && 'font-semibold')}>
                        {!m.isRead && <span className="size-2 shrink-0 rounded-full bg-blue-500" title="Non lu" aria-label="Non lu" />}
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.subject ?? '—'}</TableCell>
                    <TableCell>{formatDate(m.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </RecentCard>

        <RecentCard title="Derniers articles publiés" href="/articles" empty="Aucun article publié pour le moment." isPending={isPending} wide>
          {data && data.recentArticles.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Publié le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentArticles.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/articles/${a.id}`} className="font-medium hover:underline">
                        {a.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.categoryName ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{a.authorName ?? '—'}</TableCell>
                    <TableCell>{formatDate(a.publishedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </RecentCard>
      </div>

      {data && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-semibold">Traductions ({data.parityLocale.toUpperCase()}) à faire</h2>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Sans traduction</TableHead>
                    <TableHead>Brouillons</TableHead>
                    <TableHead>Périmées</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.parity.map((section) => (
                    <TableRow key={section.key}>
                      <TableCell className="font-medium">{section.label}</TableCell>
                      {(['missing', 'draft', 'stale'] as const).map((state) => (
                        <TableCell key={state}>
                          {section[state].length === 0 ? (
                            <span className="text-muted-foreground">0</span>
                          ) : (
                            <details>
                              <summary className="cursor-pointer text-sm">{section[state].length}</summary>
                              <ul className="mt-1 space-y-0.5 text-sm">
                                {section[state].map((item) => (
                                  <li key={item.id}>
                                    <Link href={`${CONTENT_PATHS[section.key] ?? '/'}/${item.id}`} className="hover:underline">
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

function RecentCard({ title, href, empty, isPending, wide, children }: { title: string; href: string; empty: string; isPending: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <Card className={cn(wide && 'xl:col-span-2')}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardAction>
          <Link href={href} className="text-sm text-muted-foreground hover:underline">
            Tout voir
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>{isPending ? <Skeleton className="h-32" /> : (children ?? <p className="text-sm text-muted-foreground">{empty}</p>)}</CardContent>
    </Card>
  );
}
