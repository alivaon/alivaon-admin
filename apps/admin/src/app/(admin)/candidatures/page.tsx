'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { FilterBar, NativeSelect, SearchInput } from '@/components/list/filter-bar';
import { TableState } from '@/components/list/list-state';
import { PaginationBar } from '@/components/list/pagination-bar';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, integerParam, unwrapCollection } from '@/lib/api';
import { APPLICATION_STATUS_CLASSES, APPLICATION_STATUSES, formatDateTime } from '@/lib/format';
import { useListParams } from '@/lib/use-list-params';

const FILTERS = ['status', 'jobOffer', 'search'] as const;

/** Offres pour le filtre (toutes, titre français). */
function useJobOfferOptions() {
  return useQuery({
    queryKey: ['job-offers', 'options'],
    queryFn: () => unwrapCollection(api.GET('/api/admin/job-offers', { params: { query: { itemsPerPage: 100 } } })),
    select: (data) => data.member.flatMap((offer) => (offer.id === null ? [] : [{ id: offer.id, title: offer.translations.fr?.title || `Offre #${offer.id}` }])),
    staleTime: 5 * 60_000,
  });
}

function CandidaturesList() {
  const { page, filters, query, update } = useListParams(FILTERS);
  const { data: offers } = useJobOfferOptions();
  const { data, isPending, error } = useQuery({
    queryKey: ['candidate-applications', 'list', page, query],
    queryFn: () =>
      unwrapCollection(
        api.GET('/api/admin/candidate-applications', { params: { query: { page, status: query.status, search: query.search, jobOffer: integerParam(query.jobOffer) } } }),
      ),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader
        title="Candidatures"
        description="Candidatures reçues sur les offres d'emploi."
        actions={
          <a href="/api/admin/candidate-applications/export" download className={buttonVariants({ variant: 'outline' })}>
            <Download /> Exporter (CSV)
          </a>
        }
      />
      <FilterBar>
        <SearchInput value={filters.search} onChange={(search) => update({ search })} placeholder="Nom, email, ville…" />
        <NativeSelect value={filters.status} onChange={(e) => update({ status: e.target.value })} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={filters.jobOffer} onChange={(e) => update({ jobOffer: e.target.value })} aria-label="Offre" className="max-w-72">
          <option value="">Toutes les offres</option>
          {offers?.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {offer.title}
            </option>
          ))}
        </NativeSelect>
      </FilterBar>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Reçue le</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableState columns={5} isPending={isPending} error={error} empty={data?.member.length === 0}>
                {data?.member.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Link href={`/candidatures/${application.id}`} className="font-medium hover:underline">
                        {application.firstName} {application.lastName}
                      </Link>
                      <div className="text-xs text-muted-foreground">{application.email}</div>
                    </TableCell>
                    <TableCell>{application.jobOffer?.title ?? '—'}</TableCell>
                    <TableCell>{[application.city, application.country].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(application.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={APPLICATION_STATUS_CLASSES[application.status]}>{application.statusLabel}</Badge>
                    </TableCell>
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

export default function CandidaturesPage() {
  return (
    <Suspense>
      <CandidaturesList />
    </Suspense>
  );
}
