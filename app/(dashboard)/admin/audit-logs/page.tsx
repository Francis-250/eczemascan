import { getAuditLogs } from "@/lib/actions/admin";
import AuditLogsPage from "@/components/admin/audit-logs";

export default async function AuditLogsPageWrapper({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const { logs, total, totalPages } = await getAuditLogs(page);

  return <AuditLogsPage logs={logs ?? []} total={total ?? 0} page={page} totalPages={totalPages ?? 0} />;
}