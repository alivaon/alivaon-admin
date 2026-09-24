'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FilterBar, NativeSelect, SearchInput } from '@/components/list/filter-bar';
import { TableState } from '@/components/list/list-state';
import { PaginationBar } from '@/components/list/pagination-bar';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, booleanParam, unwrapCollection } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useListParams } from '@/lib/use-list-params';

const FILTERS = ['isRead', 'search'] as const;

function MessagesList() {
  const { page, filters, query, update } = useListParams(FILTERS);
  const { data, isPending, error } = useQuery({
    queryKey: ['contact-messages', 'list', page, query],
    queryFn: () => unwrapCollection(api.GET('/api/admin/contact-messages', { params: { query: { page, search: query.search, isRead: booleanParam(query.isRead) } } })),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Messages" description="Demandes reçues par le formulaire de contact." />
      <FilterBar>
        <SearchInput value={filters.search} onChange={(search) => update({ search })} placeholder="Nom, email, sujet…" />
        <NativeSelect value={filters.isRead} onChange={(e) => update({ isRead: e.target.value })} aria-label="Statut de lecture">
          <option value="">Tous</option>
          <option value="false">Non lus</option>
          <option value="true">Lus</option>
        </NativeSelect>
      </FilterBar>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Reçu le</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableState columns={5} isPending={isPending} error={error} empty={data?.member.length === 0}>
                {data?.member.map((message) => (
                  <TableRow key={message.id} className={message.isRead ? undefined : 'font-semibold'}>
                    <TableCell>
                      <Link href={`/messages/${message.id}`} className="hover:underline">
                        {message.name}
                      </Link>
                      <div className="text-xs font-normal text-muted-foreground">{message.email}</div>
                    </TableCell>
                    <TableCell>{message.subject ?? '—'}</TableCell>
                    <TableCell>{message.service ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(message.createdAt)}</TableCell>
                    <TableCell>{message.isRead ? <Badge variant="outline">Lu</Badge> : <Badge>Non lu</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableState>
            </TableBody>
          </Table>
          <PaginationBar page={page} total={data?.totalItems ?? 0} onPage={(p) => update({ page: String(p) })} />
        </CardContent>
      </Card>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesList />
    </Suspense>
  );
}
