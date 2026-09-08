import { redirect } from "next/navigation";
import { requirePatient } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isPatientProfileComplete } from "@/lib/onboarding";
import PatientHeader from "@/components/layout/patient-header";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, user } = await requirePatient();
  if (!authorized) {
    redirect("/auth/login");
  }

  const profile = await prisma.patientProfile.findUnique({ where: { userId: user!.id } });
  if (!user!.emailVerified) redirect("/auth/login");
  if (!isPatientProfileComplete(profile)) redirect("/auth/complete-profile");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-950">
      <PatientHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}