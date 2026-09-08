import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isDoctorRole } from "@/lib/onboarding";

export default async function DoctorStatusPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (!isDoctorRole(session.user.role)) redirect("/auth/continue");
  if (!session.user.emailVerified) redirect(`/auth/verify?email=${encodeURIComponent(session.user.email)}`);
  const profile = await prisma.dermatologistProfile.findUnique({ where: { userId: session.user.id } });
  if (profile?.verificationStatus === "APPROVED") redirect("/dermatologist/dashboard");
  return <div className="max-w-md p-6 space-y-4">
    <h1 className="text-2xl font-bold">{profile?.verificationStatus === "REJECTED" ? "Application not approved" : "Waiting for admin approval"}</h1>
    <p>{profile?.verificationStatus === "REJECTED" ? "Please contact the administrator about your application." : "Your doctor account cannot access patient scans until an administrator approves your medical license."}</p>
    <Link className="underline" href="/auth/continue" prefetch={false}>Check approval status</Link>
    <p><Link href="/auth/login">Back to login</Link></p>
  </div>;
}
