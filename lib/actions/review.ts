"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { ScanStatus, ReviewVerdict } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getPendingScans() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "DERMATOLOGIST") {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.dermatologistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile || profile.verificationStatus !== "APPROVED") {
    return { error: "Dermatologist not approved" };
  }

  const scans = await prisma.scan.findMany({
    where: { status: ScanStatus.PENDING_REVIEW },
    include: {
      recommendation: true,
      patient: {
        select: { name: true, patientProfile: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return { scans };
}

export async function getDermatologistReviews() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "DERMATOLOGIST") {
    return { error: "Unauthorized" };
  }

  const reviews = await prisma.scanReview.findMany({
    where: { dermatologistId: session.user.id },
    include: {
      scan: {
        include: {
          patient: { select: { name: true } },
          recommendation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { reviews };
}

export async function getDermatologistStats() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "DERMATOLOGIST") {
    return { error: "Unauthorized" };
  }

  const [pendingCount, reviewedCount, profile] = await Promise.all([
    prisma.scan.count({ where: { status: ScanStatus.PENDING_REVIEW } }),
    prisma.scanReview.count({ where: { dermatologistId: session.user.id } }),
    prisma.dermatologistProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return {
    pendingCount,
    reviewedCount,
    verificationStatus: profile?.verificationStatus ?? "PENDING",
  };
}

export async function submitScanReview(formData: FormData) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "DERMATOLOGIST") {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.dermatologistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile || profile.verificationStatus !== "APPROVED") {
    return { error: "Dermatologist not approved" };
  }

  const scanId = formData.get("scanId") as string;
  const verdict = formData.get("verdict") as ReviewVerdict;
  const correctedCondition = formData.get("correctedCondition") as string;
  const recommendationOk = formData.get("recommendationOk") === "true";

  if (!scanId || !verdict) {
    return { error: "Missing required fields" };
  }

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { patient: true },
  });

  if (!scan) {
    return { error: "Scan not found" };
  }

  if (scan.status !== ScanStatus.PENDING_REVIEW) {
    return { error: "Scan already reviewed" };
  }

  const review = await prisma.scanReview.create({
    data: {
      scanId,
      dermatologistId: session.user.id,
      verdict,
      correctedCondition: verdict === ReviewVerdict.CORRECTED ? (correctedCondition as any) : null,
      recommendationOk,
    },
  });

  const newStatus = verdict === ReviewVerdict.INCONCLUSIVE ? ScanStatus.FLAGGED : ScanStatus.REVIEWED;

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: newStatus },
  });

  await prisma.notification.create({
    data: {
      userId: scan.patientId,
      title: `Scan review completed: ${verdict}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "SUBMIT_SCAN_REVIEW",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/doctor/scans");
  revalidatePath("/doctor/reviews");
  revalidatePath("/doctor/dashboard");

  return { review };
}