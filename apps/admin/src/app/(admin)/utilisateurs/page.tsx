'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { AdminOnly } from '@/components/admin-only';
import { TableState } from '@/components/list/list-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, unwrapCollection } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { ROLE_LABELS } from './user-form';

function UsersList() {
  const { data, isPending, error } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => unwrapCollection(api.GET('/api/admin/users')),
  });

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Comptes du back-office."
        actions={
          <Link href="/utilisateurs/nouveau" className={buttonVariants()}>
            <Plus /> Inviter un utilisateur
          </Link>
        }
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôles</TableHead>
                <TableHead>Dernière connexion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableState columns={4} isPending={isPending} error={error} empty={data?.member.length === 0}>
                {data?.member.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/utilisateurs/${user.id}`} className="font-medium hover:underline">
                        {user.fullName || user.email}
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="space-x-1">
                      {user.roles
                        .filter((role) => role in ROLE_LABELS)
                        .map((role) => (
                          <Badge key={role} variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}>
                            {ROLE_LABELS[role]}
                          </Badge>
                        ))}
                    </TableCell>
                    <TableCell>{user.invitationPending ? <Badge variant="outline">Invitation en attente</Badge> : formatDateTime(user.lastLoginAt)}</TableCell>
                  </TableRow>
                ))}
              </TableState>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default function UsersPage() {
  return (
    <AdminOnly>
      <UsersList />
    </AdminOnly>
  );
}
