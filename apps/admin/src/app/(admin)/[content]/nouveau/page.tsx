'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ContentForm } from '@/components/content/content-form';
import { BackLink } from '@/components/detail';
import { PageHeader } from '@/components/page-header';
import { createContent } from '@/lib/content/api';
import { toPayload, type FormState } from '@/lib/content/form';
import { contentType } from '@/lib/content/registry';
import type { ContentType } from '@/lib/content/types';
import { useApiMutation } from '@/lib/mutation';

function NewContent({ type }: { type: ContentType }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useApiMutation({
    mutationFn: (state: FormState) => createContent(type, toPayload(type, state)),
    invalidate: [['content', type.slug], ['relation-options'], ['dashboard']],
    success: `${type.singular} créé${type.feminine ? 'e' : ''}.`,
  });

  return (
    <>
      <BackLink href={`/${type.slug}`} label={type.title} />
      <PageHeader title={type.newLabel} />
      <ContentForm
        type={type}
        error={create.error}
        pending={create.isPending}
        onSubmit={(state) =>
          create.mutate(state, {
            onSuccess: (item) => {
              queryClient.setQueryData(['content', type.slug, String(item.id)], item);
              router.push(`/${type.slug}/${item.id}`);
            },
          })
        }
      />
    </>
  );
}

export default function Page() {
  const type = contentType(useParams<{ content: string }>().content);
  if (!type) {
    notFound();
  }

  return <NewContent key={type.slug} type={type} />;
}
