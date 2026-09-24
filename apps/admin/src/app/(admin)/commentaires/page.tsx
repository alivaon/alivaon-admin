'use client';

import { Suspense } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Check, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FilterBar, NativeSelect } from '@/components/list/filter-bar';
import { TableState } from '@/components/list/list-state';
import { PaginationBar } from '@/components/list/pagination-bar';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, booleanParam, integerParam, unwrap, unwrapCollection } from '@/lib/api';
import { isAdmin, useCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { useApiMutation } from '@/lib/mutation';
import { useListParams } from '@/lib/use-list-params';
import { ReplyDialog } from './reply-dialog';

const FILTERS = ['isApproved', 'article'] as const;

/** Tous les articles (titre français), pour le filtre : l'API plafonne à 100 par page. */
function useArticleOptions() {
  return useQuery({
    queryKey: ['articles', 'options'],
    queryFn: async () => {
      const options: { id: number; title: string }[] = [];
      for (let page = 1; ; page++) {
        const { member, totalItems } = await unwrapCollection(api.GET('/api/admin/articles', { params: { query: { page, itemsPerPage: 100 } } }));
        for (const article of member) {
          if (article.id !== null) {
            options.push({ id: article.id, title: article.translations.fr?.title || `Article #${article.id}` });
          }
        }
        if (member.length === 0 || options.length >= totalItems) {
          return options.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
        }
      }
    },
    staleTime: 5 * 60_000,
  });
}

function CommentActions({ id, isApproved, authorName, canReply }: { id: number; isApproved: boolean; authorName: string; canReply: boolean }) {
  const path = { path: { id: String(id) } };
  const approve = useApiMutation({
    mutationFn: (value: boolean) => unwrap(api.PUT('/api/admin/comments/{id}/approval', { params: path, body: { isApproved: value } })),
    invalidate: [['comments']],
    success: (comment) => (comment.isApproved ? 'Commentaire approuvé.' : 'Commentaire masqué.'),
  });
  const remove = useApiMutation({
    mutationFn: () => unwrap(api.DELETE('/api/admin/comments/{id}', { params: path })),
    invalidate: [['comments']],
    success: 'Commentaire supprimé.',
  });

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" disabled={approve.isPending} onClick={() => approve.mutate(!isApproved)}>
        {isApproved ? <X /> : <Check />} {isApproved ? 'Masquer' : 'Approuver'}
      </Button>
      {canReply && <ReplyDialog commentId={id} authorName={authorName} />}
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Supprimer">
            <Trash2 />
          </Button>
        }
        title="Supprimer ce commentaire ?"
        description="Le commentaire et ses réponses seront définitivement supprimés."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => remove.mutateAsync()}
      />
    </div>
  );
}

function CommentsList() {
  const { page, filters, query, update } = useListParams(FILTERS);
  const { data: user } = useCurrentUser();
  const { data: articles } = useArticleOptions();
  const { data, isPending, error } = useQuery({
    queryKey: ['comments', 'list', page, query],
    queryFn: () =>
      unwrapCollection(api.GET('/api/admin/comments', { params: { query: { page, isApproved: booleanParam(query.isApproved), article: integerParam(query.article) } } })),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Commentaires" description="Modération des commentaires du blog." />
      <FilterBar>
        <NativeSelect value={filters.isApproved} onChange={(e) => update({ isApproved: e.target.value })} aria-label="Modération">
          <option value="">Tous</option>
          <option value="false">En attente</option>
          <option value="true">Approuvés</option>
        </NativeSelect>
        <NativeSelect value={filters.article} onChange={(e) => update({ article: e.target.value })} aria-label="Article" className="max-w-80">
          <option value="">Tous les articles</option>
          {articles?.map((article) => (
            <option key={article.id} value={article.id}>
              {article.title}
            </option>
          ))}
        </NativeSelect>
      </FilterBar>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auteur</TableHead>
                <TableHead className="w-[40%]">Commentaire</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableState columns={6} isPending={isPending} error={error} empty={data?.member.length === 0}>
                {data?.member.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="font-medium">{comment.authorName}</div>
                      <div className="text-xs text-muted-foreground">{comment.authorEmail}</div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {comment.parentId !== null && (
                        <Badge variant="outline" className="mb-1">
                          Réponse
                        </Badge>
                      )}
                      <p className="line-clamp-3 text-sm">{comment.content}</p>
                      {comment.repliesCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {comment.repliesCount} réponse{comment.repliesCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="max-w-56 whitespace-normal">
                      <span className="line-clamp-2 text-sm" title={comment.article.title ? String(comment.article.title) : undefined}>
                        {comment.article.title ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(comment.createdAt)}</TableCell>
                    <TableCell>{comment.isApproved ? <Badge variant="outline">Approuvé</Badge> : <Badge>En attente</Badge>}</TableCell>
                    <TableCell>
                      <CommentActions id={comment.id} isApproved={comment.isApproved} authorName={comment.authorName} canReply={isAdmin(user) && comment.parentId === null} />
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

export default function CommentsPage() {
  return (
    <Suspense>
      <CommentsList />
    </Suspense>
  );
}
