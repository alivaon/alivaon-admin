'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Send, Trash2 } from 'lucide-react';
import { AdminOnly } from '@/components/admin-only';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BackLink, DetailState } from '@/components/detail';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { api, unwrap } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { useApiMutation } from '@/lib/mutation';
import { avatarFileName, UserForm, type UserInput } from '../user-form';

function EditUser() {
  const id = String(useParams<{ id: string }>().id);
  const router = useRouter();
  const { data: me } = useCurrentUser();
  const path = { path: { id } };
  const { data: user, isPending, error } = useQuery({
    queryKey: ['users', id],
    queryFn: () => unwrap(api.GET('/api/admin/users/{id}', { params: path })),
  });

  const update = useApiMutation({
    mutationFn: (input: UserInput) => unwrap(api.PUT('/api/admin/users/{id}', { params: path, body: input })),
    invalidate: [['users'], ['auth']],
    success: 'Utilisateur enregistré.',
  });
  const invite = useApiMutation({
    mutationFn: () => unwrap(api.POST('/api/admin/users/{id}/invitation', { params: path })),
    invalidate: [['users']],
    success: 'Invitation renvoyée.',
  });
  const remove = useApiMutation({
    mutationFn: () => unwrap(api.DELETE('/api/admin/users/{id}', { params: path })),
    invalidate: [['users']],
    success: 'Utilisateur supprimé.',
  });

  return (
    <>
      <BackLink href="/utilisateurs" label="Utilisateurs" />
      <DetailState isPending={isPending} error={error}>
        {() =>
          user && (
            <>
              <PageHeader
                title={user.fullName || user.email}
                description={
                  user.invitationPending
                    ? `Invitation en attente, valable jusqu'au ${formatDateTime(user.invitationExpiresAt)}`
                    : `Dernière connexion : ${formatDateTime(user.lastLoginAt)}`
                }
                actions={
                  <>
                    {user.invitationPending && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="outline">
                            <Send /> Renvoyer l&apos;invitation
                          </Button>
                        }
                        title="Renvoyer l'invitation ?"
                        description={`Un nouveau lien est envoyé à ${user.email} ; l'ancien ne fonctionne plus.`}
                        confirmLabel="Renvoyer"
                        onConfirm={() => invite.mutateAsync()}
                      />
                    )}
                    {me?.id !== user.id && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="destructive">
                            <Trash2 /> Supprimer
                          </Button>
                        }
                        title="Supprimer cet utilisateur ?"
                        description={`Le compte ${user.email} sera définitivement supprimé.`}
                        confirmLabel="Supprimer"
                        destructive
                        onConfirm={async () => {
                          await remove.mutateAsync();
                          router.push('/utilisateurs');
                        }}
                      />
                    )}
                  </>
                }
              />
              <UserForm
                key={user.id}
                initial={{ ...user, avatarName: avatarFileName(user.avatar) }}
                creating={false}
                error={update.error}
                pending={update.isPending}
                submitLabel="Enregistrer"
                onSubmit={(input) => update.mutate(input)}
              />
            </>
          )
        }
      </DetailState>
    </>
  );
}

export default function UserPage() {
  return (
    <AdminOnly>
      <EditUser />
    </AdminOnly>
  );
}
