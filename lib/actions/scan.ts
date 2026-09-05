"use server";

import { prisma } from "@/lib/prisma";
import { predictEczemaCondition } from "@/lib/brevo";
import { getSession } from "@/lib/auth-server";
import { ScanCondition, ScanStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createScan(formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (session.user.role !== "PATIENT") {
    return { error: "Only patients can create scans" };
  }

  const imageFile = formData.get("image") as File;
  const lesionLocation = formData.get("lesionLocation") as string;
  const duration = formData.get("duration") as string;
  const itchingSeverity = formData.get("itchingSeverity") as string;
  const skinAppearance = formData.get("skinAppearance") as string;
  const rednessLevel = formData.get("rednessLevel") as string;
  const drynessScaling = formData.get("drynessScaling") as string;
  const triggerExposure = formData.get("triggerExposure") as string;
  const description = formData.get("description") as string;

  if (!imageFile || imageFile.size === 0) {
    return { error: "Image is required" };
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  const age = patientProfile?.dateOfBirth
    ? Math.floor((Date.now() - new Date(patientProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  const sex = patientProfile?.sex ?? "Unknown";

  const aiResult = await predictEczemaCondition({
    age,
    sex,
    lesionLocation,
    duration,
    itchingSeverity,
    skinAppearance,
    rednessLevel,
    drynessScaling,
    allergyHistory: patientProfile?.allergyHistory ?? false,
    familyHistory: patientProfile?.familyHistory ?? false,
    triggerExposure,
    description,
  });

  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const imageUrl = `/uploads/${Date.now()}-${imageFile.name}`;

  const scan = await prisma.scan.create({
    data: {
      imageUrl,
      patientId: session.user.id,
      aiCondition: aiResult.condition as ScanCondition,
      aiConfidenceScore: aiResult.confidenceScore,
      aiExplanation: aiResult.explanation,
      status: ScanStatus.PENDING_REVIEW,
      recommendation: {
        create: {
          condition: aiResult.condition as ScanCondition,
          careAdvice: await getCareAdvice(aiResult.condition as ScanCondition),
        },
      },
    },
    include: {
      recommendation: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Scan submitted for review",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_SCAN",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/patient/scans");
  return { scan };
}

async function getCareAdvice(condition: ScanCondition): Promise<string> {
  const guideline = await prisma.careGuideline.findUnique({
    where: { condition },
  });
  return guideline?.advice ?? "Please consult a dermatologist for personalized care advice.";
}

export async function getPatientScans() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const scans = await prisma.scan.findMany({
    where: { patientId: session.user.id },
    include: {
      recommendation: true,
      review: {
        include: {
          dermatologist: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { scans };
}

export async function getScanById(scanId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      recommendation: true,
      review: {
        include: {
          dermatologist: {
            select: { name: true, dermatologistProfile: { select: { specialty: true } } },
          },
        },
      },
      patient: {
        select: { name: true, patientProfile: true },
      },
    },
  });

  if (!scan) {
    return { error: "Scan not found" };
  }

  if (session.user.role === "PATIENT" && scan.patientId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  if (session.user.role === "DERMATOLOGIST") {
    const profile = await prisma.dermatologistProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile || profile.verificationStatus !== "APPROVED") {
      return { error: "Dermatologist not approved" };
    }
  }

  return { scan };
}