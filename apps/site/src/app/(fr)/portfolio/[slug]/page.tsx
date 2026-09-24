import { PortfolioShowPage } from '@/components/pages/portfolio/portfolio-show-page';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <PortfolioShowPage locale="fr" slug={(await params).slug} />;
}
