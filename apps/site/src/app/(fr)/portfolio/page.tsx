import { PortfolioIndexPage } from '@/components/pages/portfolio/portfolio-index-page';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PortfolioIndexPage locale="fr" searchParams={await searchParams} />;
}
