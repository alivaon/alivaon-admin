'use client';

import { notFound, useParams } from 'next/navigation';
import { Suspense } from 'react';
import { ContentList } from '@/components/content/content-list';
import { contentType } from '@/lib/content/registry';

function ContentListPage() {
  const type = contentType(useParams<{ content: string }>().content);
  if (!type) {
    notFound();
  }

  return <ContentList key={type.slug} type={type} />;
}

export default function Page() {
  return (
    <Suspense>
      <ContentListPage />
    </Suspense>
  );
}
