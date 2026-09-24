'use client';

import { useRouter } from 'next/navigation';
import { AdminOnly } from '@/components/admin-only';
import { BackLink } from '@/components/detail';
import { PageHeader } from '@/components/page-header';
import { api, unwrap } from '@/lib/api';
import { useApiMutation } from '@/lib/mutation';
import { UserForm, type UserInput } from '../user-form';

export default function NewUserPage() {
  const router = useRouter();
  const create = useApiMutation({
    mutationFn: (input: UserInput) => unwrap(api.POST('/api/admin/users', { body: input })),
    invalidate: [['users']],
    success: (user) => `Invitation envoyée à ${user.email}.`,
  });

  return (
    <AdminOnly>
      <BackLink href="/utilisateurs" label="Utilisateurs" />
      <PageHeader title="Inviter un utilisateur" />
      <UserForm
        initial={{ email: '', fullName: null, roles: ['ROLE_EDITOR'] }}
        creating
        error={create.error}
        pending={create.isPending}
        submitLabel="Envoyer l'invitation"
        onSubmit={(input) => create.mutate(input, { onSuccess: (user) => router.push(`/utilisateurs/${user.id}`) })}
      />
    </AdminOnly>
  );
}
