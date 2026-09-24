'use client';

import { useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ContentForm } from '@/components/content/content-form';
import { BackLink, DetailState } from '@/components/detail';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { deleteContent, getContent, updateContent } from '@/lib/content/api';
import { itemLabel, toPayload, type FormState } from '@/lib/content/form';
import { contentType } from '@/lib/content/registry';
import type { ContentType } from '@/lib/content/types';
import { formatDateTime } from '@/lib/format';
import { useApiMutation } from '@/lib/mutation';

function EditContent({ type, id }: { type: ContentType; id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Réinitialise le formulaire sur la version enregistrée après chaque sauvegarde.
  const [version, setVersion] = useState(0);
  const key = ['content', type.slug, id];
  const { data: item, isPending, error } = useQuery({ queryKey: key, queryFn: () => getContent(type, id) });
  const done = `${type.singular} ${type.feminine ? 'enregistrée' : 'enregistré'}.`;

  const save = useApiMutation({
    mutationFn: (state: FormState) => updateContent(type, id, toPayload(type, state)),
    invalidate: [['content', type.slug, 'list'], ['relation-options'], ['dashboard']],
    success: done,
  });
  const remove = useApiMutation({
    mutationFn: () => deleteContent(type, id),
    invalidate: [['content', type.slug], ['relation-options'], ['dashboard']],
    success: `${type.singular} supprimé${type.feminine ? 'e' : ''}.`,
  });

  return (
    <>
      <BackLink href={`/${type.slug}`} label={type.title} />
      <DetailState isPending={isPending} error={error}>
        {() =>
          item && (
            <>
              <PageHeader
                title={itemLabel(type, item)}
                description={typeof item.updatedAt === 'string' ? `Modifié le ${formatDateTime(item.updatedAt)}` : undefined}
              />
              <ContentForm
                key={version}
                type={type}
                item={item}
                error={save.error}
                pending={save.isPending}
                actions={
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="destructive">
                        <Trash2 /> Supprimer
                      </Button>
                    }
                    title={`Supprimer « ${itemLabel(type, item)} » ?`}
                    description="Le contenu et ses traductions seront définitivement supprimés. Ses pages publiques renverront une erreur 404."
                    confirmLabel="Supprimer"
                    destructive
                    onConfirm={async () => {
                      await remove.mutateAsync();
                      router.push(`/${type.slug}`);
                    }}
                  />
                }
                onSubmit={(state) =>
                  save.mutate(state, {
                    onSuccess: (saved) => {
                      queryClient.setQueryData(key, saved);
                      setVersion((v) => v + 1);
                    },
                  })
                }
              />
            </>
          )
        }
      </DetailState>
    </>
  );
}

export default function Page() {
  const params = useParams<{ content: string; id: string }>();
  const type = contentType(params.content);
  if (!type || !/^\d+$/.test(params.id)) {
    notFound();
  }

  return <EditContent key={`${type.slug}-${params.id}`} type={type} id={params.id} />;
}
