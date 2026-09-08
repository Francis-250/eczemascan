"use server";

import sharp from "sharp";
import { isDoctorRole, isPatientProfileComplete } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { predictEczemaCondition } from "@/lib/groq";
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

  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } });
  if (!session.user.emailVerified || !isPatientProfileComplete(profile)) return { error: "Complete your patient profile before submitting a scan." };

  const imageFile = formData.get("image") as File;
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "Image is required" };
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type) || imageFile.size > 10 * 1024 * 1024) {
    return { error: "Upload a JPG, PNG, or WebP image up to 10MB." };
  }

  let imageUrl: string;
  try {
    // Decode real pixels, limit decompression, normalize orientation and remove metadata.
    const imageBuffer = await sharp(Buffer.from(await imageFile.arrayBuffer()), { limitInputPixels: 33_177_600 })
      .rotate()
      .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    imageUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  } catch {
    return { error: "The image could not be read. Please upload a valid JPG, PNG, or WebP photograph." };
  }

  let aiResult;
  try {
    aiResult = await predictEczemaCondition({ imageUrl });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Image analysis failed. Please try again." };
  }

  // Persist the normalized photograph with its assessment, instead of a nonexistent upload path.

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

  if (isDoctorRole(session.user.role)) {
    const profile = await prisma.dermatologistProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile || profile.verificationStatus !== "APPROVED") {
      return { error: "Dermatologist not approved" };
    }
  }

  return { scan };
}