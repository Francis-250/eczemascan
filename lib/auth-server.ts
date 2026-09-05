import { auth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getUserRole() {
  const session = await getSession();
  return session?.user?.role ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, user: null };
  }
  return { session, user: session.user };
}

export async function requireRole(allowedRoles: string[]) {
  const { user } = await requireAuth();
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return { session: null, user: null, authorized: false };
  }
  return { session: await getSession(), user, authorized: true };
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireDermatologist() {
  return requireRole(["DERMATOLOGIST"]);
}

export async function requirePatient() {
  return requireRole(["PATIENT"]);
}