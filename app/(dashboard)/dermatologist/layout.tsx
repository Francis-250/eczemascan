import { redirect } from "next/navigation";
import { requireDermatologist } from "@/lib/auth-server";
import DermatologistSidebar from "@/components/layout/dermatologist-sidebar";

export default async function DermatologistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized } = await requireDermatologist();
  if (!authorized) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      <DermatologistSidebar>{children}</DermatologistSidebar>
    </div>
  );
}