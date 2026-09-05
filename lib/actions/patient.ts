"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export async function getPatientSupportTickets() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { patientId: session.user.id },
    include: {
      handledBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { tickets };
}

export async function createSupportTicket(formData: FormData) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;

  if (!subject || !description) {
    return { error: "Subject and description are required" };
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      patientId: session.user.id,
      subject,
      resolved: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_SUPPORT_TICKET",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/patient/support");
  return { ticket };
}

export async function getPatientNotifications() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return { notifications };
}

export async function markNotificationRead(notificationId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/patient/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/patient/notifications");
  return { success: true };
}