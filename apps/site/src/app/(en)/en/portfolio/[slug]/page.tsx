import { PortfolioShowPage } from '@/components/pages/portfolio/portfolio-show-page';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <PortfolioShowPage locale="en" slug={(await params).slug} />;
}
