import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DermatologistVerifyDetail from "@/components/admin/dermatologist-verify-detail";

export default async function DermatologistVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const dermatologist = await prisma.dermatologistProfile.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          patientScans: {
            include: { recommendation: true, review: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          auditLogs: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          dermatologistReviews: {
            include: {
              scan: {
                include: { patient: { select: { name: true } }, recommendation: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (!dermatologist) {
    notFound();
  }

  return (
    <DermatologistVerifyDetail
      dermatologist={{
        ...dermatologist,
        reviews: dermatologist.user.dermatologistReviews,
      }}
    />
  );
}