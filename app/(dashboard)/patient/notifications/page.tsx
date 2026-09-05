import { getPatientNotifications } from "@/lib/actions/patient";
import NotificationsPage from "@/components/patient/notifications-page";

export default async function NotificationsPageWrapper() {
  const { notifications } = await getPatientNotifications();

  return <NotificationsPage notifications={notifications ?? []} />;
}