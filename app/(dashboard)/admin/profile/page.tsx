import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminProfile from "@/components/admin/profile";

export default async function AdminProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return <AdminProfile user={session.user} />;
}