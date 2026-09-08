"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["PATIENT", "DERMATOLOGIST"]),
  licenseNumber: z.string().trim().max(100).optional(),
}).refine(value => value.role !== "DERMATOLOGIST" || !!value.licenseNumber, { message: "Dermatologists must provide their medical license number." });

export async function registerAccount(input: z.infer<typeof registrationSchema>) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, role, licenseNumber } = parsed.data;
  if (role === "DERMATOLOGIST" && await prisma.dermatologistProfile.findUnique({ where: { licenseNumber } })) {
    return { error: "This medical license number is already registered." };
  }
  try {
    const result = await auth.api.signUpEmail({ headers: new Headers({ "x-registration-role": role }), body: { name, email, password } });
    if (role === "DERMATOLOGIST") {
      // No session is issued before email verification. A nested write assigns the role and pending profile together.
      await prisma.user.update({ where: { id: result.user.id }, data: {
        role: "DERMATOLOGIST",
        dermatologistProfile: { create: { licenseNumber: licenseNumber!, verificationStatus: "PENDING" } },
      } });
    }
    return { success: true };
  } catch {
    return { error: "Registration could not be completed. If your account was created, verify your email and contact support before trying again." };
  }
}
