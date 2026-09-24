'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FileDown, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BackLink, DetailList, DetailState } from '@/components/detail';
import { NativeSelect } from '@/components/list/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, unwrap } from '@/lib/api';
import { APPLICATION_STATUS_CLASSES, APPLICATION_STATUSES, formatDateTime, type ApplicationStatus } from '@/lib/format';
import { useApiMutation } from '@/lib/mutation';

function ExternalLink({ href }: { href: string | null }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {href}
    </a>
  ) : null;
}

export default function CandidaturePage() {
  const id = String(useParams<{ id: string }>().id);
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const { data: application, isPending, error } = useQuery({
    queryKey: ['candidate-applications', id],
    queryFn: () => unwrap(api.GET('/api/admin/candidate-applications/{id}', { params: { path: { id } } })),
  });

  const changeStatus = useApiMutation({
    mutationFn: (value: ApplicationStatus) => unwrap(api.PUT('/api/admin/candidate-applications/{id}/status', { params: { path: { id } }, body: { status: value } })),
    invalidate: [['candidate-applications'], ['dashboard']],
    success: 'Statut mis à jour, le candidat a été prévenu par email.',
  });

  const remove = useApiMutation({
    mutationFn: () => unwrap(api.DELETE('/api/admin/candidate-applications/{id}', { params: { path: { id } } })),
    invalidate: [['candidate-applications'], ['dashboard']],
    success: 'Candidature supprimée.',
  });

  return (
    <>
      <BackLink href="/candidatures" label="Candidatures" />
      <DetailState isPending={isPending} error={error}>
        {() => {
          if (!application) {
            return null;
          }
          const selected = status ?? (application.status as ApplicationStatus);
          const selectedLabel = APPLICATION_STATUSES.find((s) => s.value === selected)?.label ?? selected;

          return (
            <>
              <PageHeader
                title={`${application.firstName} ${application.lastName}`}
                description={`${application.jobOffer?.title ?? 'Offre supprimée'} — reçue le ${formatDateTime(application.createdAt)}`}
                actions={
                  <>
                    {application.cvUrl && (
                      <a href={application.cvUrl} className={buttonVariants({ variant: 'outline' })}>
                        <FileDown /> Télécharger le CV
                      </a>
                    )}
                    <ConfirmDialog
                      trigger={
                        <Button variant="destructive">
                          <Trash2 /> Supprimer
                        </Button>
                      }
                      title="Supprimer cette candidature ?"
                      description="La candidature et son CV seront définitivement supprimés."
                      confirmLabel="Supprimer"
                      destructive
                      onConfirm={async () => {
                        await remove.mutateAsync();
                        router.push('/candidatures');
                      }}
                    />
                  </>
                }
              />
              <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Motivation</CardTitle>
                    </CardHeader>
                    <CardContent className="whitespace-pre-line text-sm leading-relaxed">{application.motivation}</CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Coordonnées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailList
                        items={[
                          ['Email', <a key="e" href={`mailto:${application.email}`} className="hover:underline">{application.email}</a>],
                          ['Téléphone', application.phone],
                          ['Ville', application.city],
                          ['Pays', application.country],
                          ['LinkedIn', <ExternalLink key="l" href={application.linkedinUrl} />],
                          ['Portfolio', <ExternalLink key="p" href={application.portfolioUrl} />],
                        ]}
                      />
                    </CardContent>
                  </Card>
                </div>
                <Card className="self-start">
                  <CardHeader>
                    <CardTitle>Statut</CardTitle>
                    <CardDescription>Chaque changement envoie un email au candidat.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className={APPLICATION_STATUS_CLASSES[application.status]}>{application.statusLabel}</Badge>
                    <NativeSelect value={selected} onChange={(e) => setStatus(e.target.value as ApplicationStatus)} aria-label="Nouveau statut" className="w-full">
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </NativeSelect>
                    <ConfirmDialog
                      trigger={
                        <Button className="w-full" disabled={selected === application.status}>
                          Changer le statut
                        </Button>
                      }
                      title={`Passer la candidature en « ${selectedLabel} » ?`}
                      description={`Un email sera envoyé à ${application.email} pour l'informer du changement.`}
                      confirmLabel="Changer et prévenir"
                      onConfirm={async () => {
                        await changeStatus.mutateAsync(selected);
                        setStatus(null);
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          );
        }}
      </DetailState>
    </>
  );
}
