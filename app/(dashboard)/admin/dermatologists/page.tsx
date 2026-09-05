import { getDermatologists } from "@/lib/actions/admin";
import DermatologistsManagement from "@/components/admin/dermatologists-management";
import { VerificationStatus } from "@prisma/client";

export default async function DermatologistsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const status = params.status as VerificationStatus | undefined;
  const page = parseInt(params.page || "1");

  const { dermatologists, total, totalPages } = await getDermatologists(status, page);

  return <DermatologistsManagement dermatologists={dermatologists ?? []} total={total ?? 0} page={page} totalPages={totalPages ?? 0} status={status} />;
}