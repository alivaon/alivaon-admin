import { BlogListPage } from '@/components/pages/blog/blog-list-page';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <BlogListPage locale="en" filter={null} searchParams={await searchParams} />;
}
