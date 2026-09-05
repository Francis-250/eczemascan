import { getPatientProfile } from "@/lib/actions/profile";
import ScanForm from "@/components/patient/scan-form";

export default async function NewScanPage() {
  const { profile } = await getPatientProfile();

  return <ScanForm initialProfile={profile} />;
}