'use client';

import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Check, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FilterBar, NativeSelect, SearchInput } from '@/components/list/filter-bar';
import { TableState } from '@/components/list/list-state';
import { PaginationBar } from '@/components/list/pagination-bar';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteContent, listContent } from '@/lib/content/api';
import { itemLabel, TRANSLATION_STATUS, translationStatus } from '@/lib/content/form';
import type { Column, ContentItem, ContentType } from '@/lib/content/types';
import { formatDateTime } from '@/lib/format';
import { useApiMutation } from '@/lib/mutation';
import { useListParams } from '@/lib/use-list-params';
import { cn } from '@/lib/utils';
import { useRelationOptions } from './field-input';

function RelationName({ relation, id }: { relation: Extract<Column, { kind: 'relation' }>['relation']; id: unknown }) {
  const { data } = useRelationOptions(relation);
  return <>{typeof id === 'number' ? (data?.find((o) => o.value === id)?.label ?? '…') : '—'}</>;
}

function Cell({ type, column, item }: { type: ContentType; column: Column; item: ContentItem }) {
  switch (column.kind) {
    case 'label':
      return (
        <Link href={`/${type.slug}/${item.id}`} className="line-clamp-2 font-medium hover:underline">
          {type.mainLabelField ? String(item.translations.fr?.[type.labelField] ?? '—') : itemLabel(type, item)}
        </Link>
      );
    case 'en-status': {
      const status = TRANSLATION_STATUS[translationStatus(item.translations.en)];
      return (
        <Badge className={status.className} title={status.title}>
          {status.label}
        </Badge>
      );
    }
    case 'boolean':
      return item[column.field] === true ? <Check className="size-4 text-green-600" aria-label="Oui" /> : <span className="text-muted-foreground">—</span>;
    case 'datetime':
      return <span className="whitespace-nowrap">{formatDateTime(item[column.field] as string | null)}</span>;
    case 'relation':
      return <RelationName relation={column.relation} id={item[column.field]} />;
    case 'translated':
      return <>{String(item.translations.fr?.[column.field] ?? '—')}</>;
    default: {
      const value = item[column.field];
      return <>{value === null || value === undefined || value === '' ? '—' : String(value)}</>;
    }
  }
}

function DeleteButton({ type, item }: { type: ContentType; item: ContentItem }) {
  const remove = useApiMutation({
    mutationFn: () => deleteContent(type, item.id),
    invalidate: [['content', type.slug], ['relation-options'], ['dashboard']],
    success: `${type.singular} supprimé${type.feminine ? 'e' : ''}.`,
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Supprimer ${itemLabel(type, item)}`}>
          <Trash2 />
        </Button>
      }
      title={`Supprimer « ${itemLabel(type, item)} » ?`}
      description="Le contenu et ses traductions seront définitivement supprimés. Ses pages publiques renverront une erreur 404."
      confirmLabel="Supprimer"
      destructive
      onConfirm={() => remove.mutateAsync()}
    />
  );
}

export function ContentList({ type }: { type: ContentType }) {
  const { page, filters, query, update } = useListParams(['search', ...type.booleanFilters.map((f) => f.field)]);
  const { data, isPending, error } = useQuery({
    queryKey: ['content', type.slug, 'list', page, query],
    queryFn: () => listContent(type, { page, ...query }),
    placeholderData: keepPreviousData,
  });
  const columns = type.columns.length + 1;

  return (
    <>
      <PageHeader
        title={type.title}
        description={type.description}
        actions={
          <Link href={`/${type.slug}/nouveau`} className={buttonVariants()}>
            <Plus /> {type.newLabel}
          </Link>
        }
      />
      <FilterBar>
        <SearchInput value={filters.search} onChange={(search) => update({ search })} />
        {type.booleanFilters.map((filter) => (
          <NativeSelect key={filter.field} value={filters[filter.field]} onChange={(e) => update({ [filter.field]: e.target.value })} aria-label={filter.label}>
            <option value="">{filter.label} : tous</option>
            <option value="true">{filter.yes}</option>
            <option value="false">{filter.no}</option>
          </NativeSelect>
        ))}
      </FilterBar>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {type.columns.map((column) => (
                  <TableHead key={column.label}>{column.label}</TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableState columns={columns} isPending={isPending} error={error} empty={data?.member.length === 0}>
                {data?.member.map((item) => (
                  <TableRow key={item.id}>
                    {type.columns.map((column) => (
                      <TableCell key={column.label} className={cn(column.kind === 'label' && 'max-w-md whitespace-normal')}>
                        <Cell type={type} column={column} item={item} />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <DeleteButton type={type} item={item} />
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
