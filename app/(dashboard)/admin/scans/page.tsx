import { getAllScans } from "@/lib/actions/admin";
import AdminScansList from "@/components/admin/scans-management";

export default async function AdminScansPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const { scans, total, totalPages } = await getAllScans(page);

  return <AdminScansList scans={scans ?? []} total={total ?? 0} page={page} totalPages={totalPages ?? 0} />;
}