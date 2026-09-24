import { TeamShowPage } from '@/components/pages/team/team-show-page';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <TeamShowPage locale="fr" slug={(await params).slug} />;
}
