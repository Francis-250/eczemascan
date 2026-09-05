"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const [
    totalScans,
    pendingReviews,
    activeUsers,
    pendingDermatologists,
    totalReviews,
    correctedReviews,
  ] = await Promise.all([
    prisma.scan.count(),
    prisma.scan.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.user.count({ where: { banned: false } }),
    prisma.dermatologistProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.scanReview.count(),
    prisma.scanReview.count({ where: { verdict: "CORRECTED" } }),
  ]);

  const accuracy = totalReviews > 0 ? ((totalReviews - correctedReviews) / totalReviews) * 100 : 0;

  return {
    totalScans,
    pendingReviews,
    activeUsers,
    pendingDermatologists,
    modelAccuracy: Math.round(accuracy * 10) / 10,
  };
}

export async function getUsers(search = "", role = "", page = 1, limit = 20) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        patientProfile: true,
        dermatologistProfile: true,
        _count: {
          select: { patientScans: true, supportTickets: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function toggleUserBan(userId: string, banned: boolean, banReason?: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (userId === session.user.id) {
    return { error: "Cannot ban yourself" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      banned,
      banReason: banned ? banReason : null,
      banExpires: banned ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: banned ? "BAN_USER" : "UNBAN_USER",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getDermatologists(status?: VerificationStatus, page = 1, limit = 20) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const where: any = {};
  if (status) {
    where.verificationStatus = status;
  }

  const [dermatologistsRaw, total] = await Promise.all([
    prisma.dermatologistProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            banned: true,
            _count: {
              select: { dermatologistReviews: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dermatologistProfile.count({ where }),
  ]);

  const dermatologists = dermatologistsRaw.map((d) => ({
    ...d,
    user: {
      id: d.user.id,
      name: d.user.name,
      email: d.user.email,
      createdAt: d.user.createdAt,
      banned: !!d.user.banned,
    },
    _count: {
      reviews: d.user._count?.dermatologistReviews ?? 0,
    },
  }));

  return { dermatologists, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function verifyDermatologist(dermatologistId: string, status: VerificationStatus) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.dermatologistProfile.update({
    where: { id: dermatologistId },
    data: {
      verificationStatus: status,
      verifiedAt: status === "APPROVED" ? new Date() : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: `VERIFY_DERMATOLOGIST_${status}`,
      ipAddress: "unknown",
    },
  });

  revalidatePath("/admin/dermatologists");
  return { success: true };
}

export async function getCareGuidelines() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const guidelines = await prisma.careGuideline.findMany({
    orderBy: { condition: "asc" },
  });

  return { guidelines };
}

export async function upsertCareGuideline(formData: FormData) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const condition = formData.get("condition") as string;
  const title = formData.get("title") as string;
  const advice = formData.get("advice") as string;

  if (!condition || !title || !advice) {
    return { error: "Missing required fields" };
  }

  const guideline = await prisma.careGuideline.upsert({
    where: { id: id || condition },
    update: { title, advice },
    create: { id: id || condition, condition: condition as any, title, advice },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: id ? "UPDATE_CARE_GUIDELINE" : "CREATE_CARE_GUIDELINE",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/admin/care-guidelines");
  return { guideline };
}

export async function getSupportTickets(status?: "OPEN" | "RESOLVED", page = 1, limit = 20) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const where: any = {};
  if (status === "OPEN") where.resolved = false;
  if (status === "RESOLVED") where.resolved = true;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        patient: { select: { name: true, email: true } },
        handledBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function assignSupportTicket(ticketId: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { handledById: session.user.id },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ASSIGN_SUPPORT_TICKET",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/admin/support-tickets");
  return { success: true };
}

export async function resolveSupportTicket(ticketId: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { resolved: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "RESOLVE_SUPPORT_TICKET",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/admin/support-tickets");
  return { success: true };
}

export async function getAuditLogs(page = 1, limit = 50) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAllScans(page = 1, limit = 20) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const [scans, total] = await Promise.all([
    prisma.scan.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        recommendation: true,
        review: { include: { dermatologist: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.scan.count(),
  ]);

  return { scans, total, page, limit, totalPages: Math.ceil(total / limit) };
}