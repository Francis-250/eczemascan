"use server";

import { isDoctorRole } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export async function getPatientProfile() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  return { profile };
}

export async function updatePatientProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    return { error: "Unauthorized" };
  }

  const dateOfBirth = formData.get("dateOfBirth") as string;
  const sex = formData.get("sex") as string;
  const skinType = formData.get("skinType") as string;
  const allergyHistory = formData.get("allergyHistory") === "true";
  const familyHistory = formData.get("familyHistory") === "true";
  const location = formData.get("location") as string;

  const birthDate = new Date(dateOfBirth);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth || "") || !Number.isFinite(birthDate.getTime()) || birthDate > new Date() || birthDate.toISOString().slice(0, 10) !== dateOfBirth || !["Male", "Female", "Other", "Prefer not to say"].includes(sex)) {
    return { error: "Enter a valid date of birth and select your sex." };
  }
  const profile = await prisma.patientProfile.upsert({
    where: { userId: session.user.id },
    update: {
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      sex: sex || null,
      skinType: skinType || null,
      allergyHistory,
      familyHistory,
      location: location || null,
    },
    create: {
      userId: session.user.id,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      sex: sex || null,
      skinType: skinType || null,
      allergyHistory,
      familyHistory,
      location: location || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_PATIENT_PROFILE",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/patient", "layout");
  revalidatePath("/auth/complete-profile");
  return { profile };
}

export async function getDermatologistProfile() {
  const session = await getSession();
  if (!session?.user || !isDoctorRole(session.user.role)) {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.dermatologistProfile.findUnique({
    where: { userId: session.user.id },
  });

  return { profile };
}

export async function updateDermatologistProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.user || !isDoctorRole(session.user.role)) {
    return { error: "Unauthorized" };
  }

  const licenseNumber = formData.get("licenseNumber") as string;
  const specialty = formData.get("specialty") as string;
  const hospitalAffiliation = formData.get("hospitalAffiliation") as string;
  const yearsOfExperience = parseInt(formData.get("yearsOfExperience") as string) || null;
  const bio = formData.get("bio") as string;

  if (!licenseNumber) {
    return { error: "License number is required" };
  }

  const existing = await prisma.dermatologistProfile.findUnique({ where: { userId: session.user.id } });
  const profile = await prisma.dermatologistProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(existing?.licenseNumber !== licenseNumber ? { verificationStatus: "PENDING", verifiedAt: null } : {}),
      licenseNumber,
      specialty: specialty || null,
      hospitalAffiliation: hospitalAffiliation || null,
      yearsOfExperience,
      bio: bio || null,
    },
    create: {
      userId: session.user.id,
      licenseNumber,
      specialty: specialty || null,
      hospitalAffiliation: hospitalAffiliation || null,
      yearsOfExperience,
      bio: bio || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_DERMATOLOGIST_PROFILE",
      ipAddress: "unknown",
    },
  });

  revalidatePath("/doctor/profile");
  return { profile };
}