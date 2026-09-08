import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isDoctorRole, isPatientProfileComplete } from "@/lib/onboarding";

export default async function ContinuePage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (!session.user.emailVerified) redirect(`/auth/verify?email=${encodeURIComponent(session.user.email)}`);
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");
  if (isDoctorRole(session.user.role)) {
    const profile = await prisma.dermatologistProfile.findUnique({ where: { userId: session.user.id } });
    redirect(profile?.verificationStatus === "APPROVED" ? "/dermatologist/dashboard" : "/auth/doctor-status");
  }
  if (session.user.role === "PATIENT") {
    const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } });
    redirect(isPatientProfileComplete(profile) ? "/patient/scans" : "/auth/complete-profile");
  }
  redirect("/auth/login");
}
