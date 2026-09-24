'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Mail, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BackLink, DetailList, DetailState } from '@/components/detail';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, unwrap } from '@/lib/api';
import { isAdmin, useCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { useApiMutation } from '@/lib/mutation';

export default function MessagePage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: message, isPending, error } = useQuery({
    queryKey: ['contact-messages', id],
    queryFn: () => unwrap(api.GET('/api/admin/contact-messages/{id}', { params: { path: { id: String(id) } } })),
  });

  const toggleRead = useApiMutation({
    mutationFn: (isRead: boolean) => unwrap(api.PUT('/api/admin/contact-messages/{id}/status', { params: { path: { id: String(id) } }, body: { isRead } })),
    invalidate: [['contact-messages'], ['dashboard']],
    success: (result) => (result.isRead ? 'Message marqué comme lu.' : 'Message marqué comme non lu.'),
  });

  const remove = useApiMutation({
    mutationFn: () => unwrap(api.DELETE('/api/admin/contact-messages/{id}', { params: { path: { id: String(id) } } })),
    invalidate: [['contact-messages'], ['dashboard']],
    success: 'Message supprimé.',
  });

  return (
    <>
      <BackLink href="/messages" label="Messages" />
      <DetailState isPending={isPending} error={error}>
        {() =>
          message && (
            <>
              <PageHeader
                title={message.subject || `Message de ${message.name}`}
                description={`Reçu le ${formatDateTime(message.createdAt)}`}
                actions={
                  <>
                    <a href={`mailto:${message.email}${message.subject ? `?subject=${encodeURIComponent(`Re: ${message.subject}`)}` : ''}`} className={buttonVariants({ variant: 'outline' })}>
                      <Mail /> Répondre
                    </a>
                    <Button variant="outline" disabled={toggleRead.isPending} onClick={() => toggleRead.mutate(!message.isRead)}>
                      {message.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                    </Button>
                    {isAdmin(user) && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="destructive">
                            <Trash2 /> Supprimer
                          </Button>
                        }
                        title="Supprimer ce message ?"
                        description="Le message sera définitivement supprimé."
                        confirmLabel="Supprimer"
                        destructive
                        onConfirm={async () => {
                          await remove.mutateAsync();
                          router.push('/messages');
                        }}
                      />
                    )}
                  </>
                }
              />
              <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <Card>
                  <CardHeader>
                    <CardTitle>Message</CardTitle>
                  </CardHeader>
                  <CardContent className="whitespace-pre-line text-sm leading-relaxed">{message.message}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Expéditeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DetailList
                      items={[
                        ['Nom', message.name],
                        ['Email', <a key="email" href={`mailto:${message.email}`} className="hover:underline">{message.email}</a>],
                        ['Téléphone', message.phone],
                        ['Service', message.service],
                        ['Statut', message.isRead ? <Badge key="s" variant="outline">Lu</Badge> : <Badge key="s">Non lu</Badge>],
                        ['Adresse IP', message.ipAddress],
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )
        }
      </DetailState>
    </>
  );
}
