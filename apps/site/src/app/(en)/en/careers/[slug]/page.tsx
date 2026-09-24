import { CareersShowPage } from '@/components/pages/careers/careers-show-page';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <CareersShowPage locale="en" slug={(await params).slug} />;
}
