import { getAdminStats } from "@/lib/actions/admin";
import AdminDashboard from "@/components/admin/dashboard";

export default async function AdminDashboardPage() {
  const { totalScans, pendingReviews, activeUsers, pendingDermatologists, modelAccuracy } = await getAdminStats();

  return (
    <AdminDashboard
      totalScans={totalScans ?? 0}
      pendingReviews={pendingReviews ?? 0}
      activeUsers={activeUsers ?? 0}
      pendingDermatologists={pendingDermatologists ?? 0}
      modelAccuracy={modelAccuracy ?? 0}
    />
  );
}