import { BlogListPage } from '@/components/pages/blog/blog-list-page';

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <BlogListPage locale="fr" filter={{ kind: 'category', slug: (await params).slug }} searchParams={await searchParams} />;
}
