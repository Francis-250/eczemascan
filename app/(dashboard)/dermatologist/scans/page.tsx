import { getPendingScans } from "@/lib/actions/review";
import ScansQueue from "@/components/dermatologist/scans-queue";

export default async function ScansQueuePage() {
  const { scans } = await getPendingScans();

  return <ScansQueue scans={scans ?? []} />;
}