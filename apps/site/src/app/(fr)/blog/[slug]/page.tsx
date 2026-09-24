import { BlogShowPage } from '@/components/pages/blog/blog-show-page';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogShowPage locale="fr" slug={(await params).slug} />;
}
