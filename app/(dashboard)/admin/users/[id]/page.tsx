import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UserDetail from "@/components/admin/user-detail";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      patientProfile: true,
      dermatologistProfile: true,
      patientScans: {
        include: { recommendation: true, review: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      supportTickets: {
        include: { handledBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    notFound();
  }

  return <UserDetail user={user} />;
}