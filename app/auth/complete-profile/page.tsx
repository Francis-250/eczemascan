import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isPatientProfileComplete } from "@/lib/onboarding";
import PatientProfileForm from "@/components/patient/profile-form";

export default async function CompleteProfilePage() {
  const session = await getSession();
  if (!session?.user || !session.user.emailVerified) redirect("/auth/login");
  if (session.user.role !== "PATIENT") redirect("/auth/continue");
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (isPatientProfileComplete(profile)) redirect("/patient/scans");
  return (
    <div className="w-full max-w-2xl p-6">
      <PatientProfileForm initialProfile={profile} onboarding />
    </div>
  );
}
