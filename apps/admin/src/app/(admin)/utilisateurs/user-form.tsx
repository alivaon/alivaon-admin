'use client';

import { useState, type FormEvent } from 'react';
import type { components } from '@alivaon/api-client';
import { ImageInput } from '@/components/content/image-input';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type UserInput = components['schemas']['AdminUser.UserInput'];

/** Rôles attribuables (UserCrudController d'EasyAdmin). */
export const ROLES = [
  { value: 'ROLE_EDITOR', label: 'Éditeur', hint: 'Contenus, messages, candidatures, commentaires' },
  { value: 'ROLE_ADMIN', label: 'Administrateur', hint: 'Tout, y compris les utilisateurs et les suppressions sensibles' },
] as const;

/** Nom du fichier d'un avatar à partir de son chemin public (/uploads/users/…). */
export function avatarFileName(avatar: string | null): string | null {
  return avatar ? (avatar.split('/').pop() ?? null) : null;
}

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

/**
 * Formulaire utilisateur. À la création, pas de mot de passe : le compte est
 * activé par l'invitation envoyée par email.
 */
export function UserForm({
  initial,
  creating,
  error,
  pending,
  submitLabel,
  onSubmit,
}: {
  initial: Omit<UserInput, 'plainPassword'>;
  creating: boolean;
  error: unknown;
  pending: boolean;
  submitLabel: string;
  onSubmit: (input: UserInput) => void;
}) {
  const [email, setEmail] = useState(initial.email);
  const [fullName, setFullName] = useState(initial.fullName ?? '');
  const [roles, setRoles] = useState<string[]>(initial.roles.filter((role) => role in ROLE_LABELS));
  const [password, setPassword] = useState('');
  const [avatarName, setAvatarName] = useState(initial.avatarName);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ email, fullName: fullName || null, roles, avatarName, plainPassword: creating || password === '' ? null : password });
  }

  return (
    <form onSubmit={submit}>
      <Card className="max-w-2xl">
        <CardContent className="space-y-5">
          <Field label="Email" htmlFor="email" error={error} path="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
          </Field>
          <Field label="Nom complet" htmlFor="fullName" error={error} path="fullName">
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Avatar" htmlFor="avatarName" error={error} path="avatarName">
            <ImageInput id="avatarName" directory="users" value={avatarName} onChange={setAvatarName} />
          </Field>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Rôles</legend>
            {ROLES.map((role) => (
              <Label key={role.value} className="flex items-start gap-2 font-normal">
                <Checkbox
                  checked={roles.includes(role.value)}
                  onCheckedChange={(checked) => setRoles((current) => (checked ? [...current, role.value] : current.filter((r) => r !== role.value)))}
                  className="mt-0.5"
                />
                <span>
                  {role.label}
                  <span className="block text-xs text-muted-foreground">{role.hint}</span>
                </span>
              </Label>
            ))}
          </fieldset>
          {!creating && (
            <Field label="Nouveau mot de passe" htmlFor="plainPassword" error={error} path="plainPassword" hint="Laisser vide pour ne pas le changer (12 caractères minimum).">
              <Input id="plainPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </Field>
          )}
          {creating && <p className="text-sm text-muted-foreground">Une invitation est envoyée par email : l&apos;utilisateur choisit lui-même son mot de passe.</p>}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
