import { getCareGuidelines } from "@/lib/actions/admin";
import CareGuidelinesManagement from "@/components/admin/care-guidelines-management";

export default async function CareGuidelinesPage() {
  const { guidelines } = await getCareGuidelines();

  return <CareGuidelinesManagement guidelines={guidelines ?? []} />;
}