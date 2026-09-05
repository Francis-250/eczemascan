import { getUsers } from "@/lib/actions/admin";
import UsersManagement from "@/components/admin/users-management";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ search?: string; role?: string; page?: string }> }) {
  const params = await searchParams;
  const search = params.search || "";
  const role = params.role || "";
  const page = parseInt(params.page || "1");

  const { users, total, totalPages } = await getUsers(search, role, page);

  return <UsersManagement users={users ?? []} total={total ?? 0} page={page} totalPages={totalPages ?? 0} search={search} role={role} />;
}