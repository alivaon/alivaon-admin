import { CareersIndexPage } from '@/components/pages/careers/careers-index-page';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CareersIndexPage locale="en" searchParams={await searchParams} />;
}
