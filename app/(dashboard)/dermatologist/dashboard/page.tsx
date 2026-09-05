import { getDermatologistStats, getPendingScans } from "@/lib/actions/review";
import DermatologistDashboard from "@/components/dermatologist/dashboard";

export default async function DermatologistDashboardPage() {
  const [{ pendingCount, reviewedCount, verificationStatus }, { scans }] = await Promise.all([
    getDermatologistStats(),
    getPendingScans(),
  ]);

  return (
    <DermatologistDashboard
      pendingCount={pendingCount ?? 0}
      reviewedCount={reviewedCount ?? 0}
      verificationStatus={verificationStatus ?? "PENDING"}
      recentScans={scans?.slice(0, 5) ?? []}
    />
  );
}