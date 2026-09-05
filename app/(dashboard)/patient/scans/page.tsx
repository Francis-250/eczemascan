import { getPatientScans } from "@/lib/actions/scan";
import ScansList from "@/components/patient/scans-list";

export default async function ScansPage() {
  const { scans } = await getPatientScans();

  return <ScansList scans={scans ?? []} />;
}