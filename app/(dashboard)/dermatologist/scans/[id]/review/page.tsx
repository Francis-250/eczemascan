import { getScanById } from "@/lib/actions/scan";
import { notFound } from "next/navigation";
import ScanReviewPage from "@/components/dermatologist/scan-review";

export default async function ScanReviewPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { scan, error } = await getScanById(id);

  if (error || !scan) {
    notFound();
  }

  return <ScanReviewPage scan={scan} />;
}