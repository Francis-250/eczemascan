import { getSupportTickets } from "@/lib/actions/admin";
import SupportTicketsManagement from "@/components/admin/support-tickets-management";

export default async function SupportTicketsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const status = params.status as "OPEN" | "RESOLVED" | undefined;
  const page = parseInt(params.page || "1");

  const { tickets, total, totalPages } = await getSupportTickets(status, page);

  return <SupportTicketsManagement tickets={tickets ?? []} total={total ?? 0} page={page} totalPages={totalPages ?? 0} status={status} />;
}