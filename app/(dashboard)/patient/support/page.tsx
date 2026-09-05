import { getPatientSupportTickets } from "@/lib/actions/patient";
import SupportPage from "@/components/patient/support-page";

export default async function SupportPageWrapper() {
  const { tickets } = await getPatientSupportTickets();

  return <SupportPage tickets={tickets ?? []} />;
}