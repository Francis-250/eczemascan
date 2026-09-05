import { getScanById } from "@/lib/actions/scan";
import { notFound } from "next/navigation";
import ScanDetail from "@/components/patient/scan-detail";

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { scan, error } = await getScanById(id);

  if (error || !scan) {
    notFound();
  }

  return <ScanDetail scan={scan} />;
}