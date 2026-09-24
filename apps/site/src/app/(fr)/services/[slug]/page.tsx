import { ServiceShowPage } from '@/components/pages/services/service-show-page';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ServiceShowPage locale="fr" slug={(await params).slug} />;
}
