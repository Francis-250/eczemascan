import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-server";
import AdminSidebar from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      <AdminSidebar>{children}</AdminSidebar>
    </div>
  );
}