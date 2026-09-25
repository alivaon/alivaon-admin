'use client';

import { useState, type FormEvent } from 'react';
import { ImageInput } from '@/components/content/image-input';
import { Field } from '@/components/form/field';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, unwrap } from '@/lib/api';
import { CURRENT_USER_KEY, useCurrentUser, type CurrentUser } from '@/lib/auth';
import { useApiMutation } from '@/lib/mutation';
import { avatarFileName } from '../utilisateurs/user-form';

function ProfileForm({ user }: { user: NonNullable<CurrentUser> }) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [avatarName, setAvatarName] = useState(avatarFileName(user.avatar));
  const save = useApiMutation({
    mutationFn: () => unwrap(api.PUT('/api/auth/me', { body: { email, fullName: fullName || null, avatarName, plainPassword: password || null } })),
    invalidate: [CURRENT_USER_KEY],
    success: 'Profil enregistré.',
  });
  const mismatch = password !== '' && confirmation !== '' && password !== confirmation;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== '' && password !== confirmation) {
      return;
    }
    save.mutate(undefined, {
      onSuccess: () => {
        setPassword('');
        setConfirmation('');
      },
    });
  }

  return (
    <form onSubmit={submit}>
      <Card className="max-w-2xl">
        <CardContent className="space-y-5">
          <Field label="Email" htmlFor="email" error={save.error} path="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </Field>
          <Field label="Nom complet" htmlFor="fullName" error={save.error} path="fullName">
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Avatar" htmlFor="avatarName" error={save.error} path="avatarName">
            <ImageInput id="avatarName" directory="users" value={avatarName} onChange={setAvatarName} />
          </Field>
          <Field label="Nouveau mot de passe" htmlFor="plainPassword" error={save.error} path="plainPassword" hint="Laisser vide pour le conserver (12 caractères minimum).">
            <Input
              id="plainPassword"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value === '') {
                  setConfirmation('');
                }
              }}
              autoComplete="new-password"
            />
          </Field>
          {password !== '' && (
            <div className="space-y-1.5">
              <Field label="Confirmation du mot de passe" htmlFor="confirmation">
                <Input id="confirmation" type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required />
              </Field>
              {mismatch && <p className="text-xs text-destructive">Les mots de passe ne correspondent pas.</p>}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={save.isPending || mismatch}>
            Enregistrer
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function ProfilePage() {
  const { data: user } = useCurrentUser();

  return (
    <>
      <PageHeader title="Mon profil" description="Vos informations de connexion." />
      {user && <ProfileForm key={user.id} user={user} />}
    </>
  );
}
