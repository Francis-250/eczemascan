import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SupportTicketDetail from "@/components/admin/support-ticket-detail";

export default async function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, email: true, patientProfile: true } },
      handledBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!ticket) {
    notFound();
  }

  return <SupportTicketDetail ticket={ticket} />;
}