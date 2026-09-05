import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ScanCondition, ScanStatus, ReviewVerdict, VerificationStatus } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding for EczemaScan...");

  // Clean up existing seeded data to ensure idempotent seeding
  console.log("Cleaning up prior records...");
  await prisma.scanReview.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.scan.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.careGuideline.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.dermatologistProfile.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Generating hashed passwords through better-auth crypto...");
  const adminPasswordHash = await hashPassword("AdminPass123!");
  const doctorPasswordHash = await hashPassword("DoctorPass123!");
  const patientPasswordHash = await hashPassword("PatientPass123!");

  // 1. Seed Sample Admin User
  console.log("Seeding sample ADMIN user...");
  const adminUser = await prisma.user.create({
    data: {
      id: "usr_admin_sample_01",
      name: "ICT Specialist Alice Mutoni",
      email: "admin@eczemascan.rw",
      emailVerified: true,
      role: "ADMIN",
      phoneNumber: "+250788123456",
      phoneNumberVerified: true,
    },
  });

  await prisma.account.create({
    data: {
      id: "acc_admin_sample_01",
      issuer: "local:credential",
      accountId: adminUser.id,
      providerId: "credential",
      userId: adminUser.id,
      password: adminPasswordHash,
    },
  });

  // 2. Seed Sample Approved Dermatologist User with complete DermatologistProfile
  console.log("Seeding sample APPROVED DERMATOLOGIST user...");
  const doctorUser = await prisma.user.create({
    data: {
      id: "usr_doctor_sample_01",
      name: "Dr. Emmanuel Mugabo",
      email: "doctor@eczemascan.rw",
      emailVerified: true,
      role: "DERMATOLOGIST",
      phoneNumber: "+250788654321",
      phoneNumberVerified: true,
    },
  });

  await prisma.account.create({
    data: {
      id: "acc_doctor_sample_01",
      issuer: "local:credential",
      accountId: doctorUser.id,
      providerId: "credential",
      userId: doctorUser.id,
      password: doctorPasswordHash,
    },
  });

  await prisma.dermatologistProfile.create({
    data: {
      id: "prof_doctor_sample_01",
      userId: doctorUser.id,
      licenseNumber: "RW-MD-2021-4892",
      specialty: "Clinical Dermatology & Tropical Skin Pathology",
      hospitalAffiliation: "King Faisal Hospital, Kigali",
      yearsOfExperience: 12,
      bio: "Senior consultant dermatologist specializing in atopic dermatitis in skin of color, inflammatory dermatoses, and teledermatology outreach across provincial Rwanda.",
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: new Date("2024-01-15T08:30:00Z"),
    },
  });

  // 3. Seed Sample Patient User with complete PatientProfile
  console.log("Seeding sample PATIENT user...");
  const patientUser = await prisma.user.create({
    data: {
      id: "usr_patient_sample_01",
      name: "Jean Paul Habimana",
      email: "patient@eczemascan.rw",
      emailVerified: true,
      role: "PATIENT",
      phoneNumber: "+250789112233",
      phoneNumberVerified: true,
    },
  });

  await prisma.account.create({
    data: {
      id: "acc_patient_sample_01",
      issuer: "local:credential",
      accountId: patientUser.id,
      providerId: "credential",
      userId: patientUser.id,
      password: patientPasswordHash,
    },
  });

  await prisma.patientProfile.create({
    data: {
      id: "prof_patient_sample_01",
      userId: patientUser.id,
      dateOfBirth: new Date("1996-05-14T00:00:00Z"),
      sex: "Male",
      skinType: "Fitzpatrick Phototype V",
      allergyHistory: true,
      familyHistory: true,
      location: "Huye District, Southern Province",
    },
  });

  // 4. Seed Full CareGuideline entry for EVERY value in ScanCondition enum
  console.log("Seeding full CareGuideline entries for all ScanCondition values...");
  const careGuidelines = [
    {
      condition: ScanCondition.ECZEMA,
      title: "Atopic Dermatitis (Eczema) Comprehensive Care Protocol",
      advice:
        "1. Barrier Restoration: Apply dense, fragrance-free emollient creams or ointments (e.g., white petrolatum or ceramide formulations) twice daily, immediately following bathing while skin is still slightly damp.\n2. Bathing Hygiene: Limit baths and showers to 5-10 minutes in lukewarm water. Use non-soap syndet cleansers; avoid sodium lauryl sulfate and heavily scented toiletries.\n3. Anti-Pruritic Measures: Avoid scratching to prevent secondary bacterial infection (lichenification). Apply cool damp compresses to active itchy patches. Keep fingernails clean and trimmed short.\n4. Trigger Avoidance: Minimize exposure to rough woolen or synthetic fabrics; wear 100% breathable cotton. Maintain moderate indoor temperatures and minimize sweat retention.\n5. Clinical Escalation: If oozing, pustules, severe localized warmth, or fever develop, seek prompt clinical evaluation for secondary impetiginization.",
    },
    {
      condition: ScanCondition.CONTACT_DERMATITIS,
      title: "Allergic & Irritant Contact Dermatitis Management",
      advice:
        "1. Elimination of Exposure: Identify and strictly cease contact with suspected allergens or irritants (e.g., nickel buckles, costume jewelry, harsh household cleaners, cosmetic fragrances, hair dyes, or topical herbal mixtures).\n2. Gentle Cleansing: Thoroughly flush the affected skin area with lukewarm water and mild non-irritating cleanser to remove residual offending agents.\n3. Acute Symptom Relief: Apply cool saline or tap-water compresses for 15 minutes three times daily to reduce inflammation, weeping, and burning sensations.\n4. Topical Support: Apply bland emollient barriers. Over-the-counter hydrocortisone 1% may be applied sparingly for up to 7 days on non-facial skin if indicated by a clinician.\n5. Professional Follow-up: Consult a dermatologist if rash persists beyond 2 weeks or spreads extensively.",
    },
    {
      condition: ScanCondition.PSORIASIS,
      title: "Plaque Psoriasis Daily Management & Scaling Guidance",
      advice:
        "1. Hydration & Keratolysis: Generously apply thick moisturizers containing keratolytic agents (such as urea or salicylic acid) to soften and gradually loosen silvery scales without forcible picking or scraping.\n2. Skin Protection: Guard against skin abrasions, insect bites, and physical trauma, which can induce new psoriatic plaques (the Koebner phenomenon).\n3. Controlled Sunlight: Moderate, careful natural sunlight exposure can assist in reducing plaque activity; however, avoid sunburns which worsen flare-ups.\n4. Scalp Care: When scalp is involved, use therapeutic coal tar or salicylic acid shampoos left in place for 5-10 minutes prior to rinsing.\n5. Medical Supervision: Plaque psoriasis is a chronic systemic inflammatory condition requiring ongoing medical follow-up for topical corticosteroid/calcipotriene regimens and joint involvement screening.",
    },
    {
      condition: ScanCondition.FUNGAL_INFECTION,
      title: "Cutaneous Dermatophytosis (Tinea / Ringworm) Protocol",
      advice:
        "1. Anti-Fungal Application: Apply recommended topical antifungal cream (e.g., clotrimazole, terbinafine, or miconazole) twice daily covering the active erythematous ring and extending 2 cm onto normal-appearing surrounding skin.\n2. Treatment Duration: Continue topical antifungal therapy for at least 14 days after all visible signs of infection have resolved to ensure complete eradication of dermatophyte spores.\n3. Moisture Control: Keep the affected skin folds clean, dry, and aerated. Thoroughly towel dry after bathing, using a separate clean towel for the affected region.\n4. Prevent Cross-Contamination: Do not share towels, clothing, bedding, or sports gear. Launder clothing in hot water.\n5. Critical Caution: Do NOT apply topical steroid creams without antifungal coverage, as steroids suppress local immunity and cause tinea incognito.",
    },
    {
      condition: ScanCondition.OTHER,
      title: "General Dermatological Assessment & Undifferentiated Lesion Care",
      advice:
        "1. Non-Specific Supportive Care: Cleanse gently with lukewarm water and soap-free cleanser. Keep the skin surface barrier protected with pure bland emollient (such as pure petroleum jelly).\n2. Avoid Harmful Remedies: Do not apply abrasive scrubs, strong antiseptics, alcohol, or unprescribed triple-combination steroid/bleaching creams.\n3. Symptom Tracking: Record the lesion's progression, note when it first appeared, any associated pain, burning, or systemic symptoms, and changes in lesion dimensions.\n4. In-Person Specialist Evaluation: Because this condition does not fit classical profiles, direct examination by a certified dermatologist or general medical practitioner is strongly advised for accurate diagnosis.",
    },
  ];

  for (const guideline of careGuidelines) {
    await prisma.careGuideline.create({
      data: guideline,
    });
  }

  // 5. Seed Sample Scans (mix of PENDING_REVIEW and REVIEWED)
  console.log("Seeding sample Scan, Recommendation, and ScanReview records...");

  // Scan 1: REVIEWED - CONFIRMED Eczema
  const scan1 = await prisma.scan.create({
    data: {
      id: "scan_sample_01",
      imageUrl: "/samples/lesion-eczema-1.svg",
      patientId: patientUser.id,
      aiCondition: ScanCondition.ECZEMA,
      aiConfidenceScore: 0.94,
      aiExplanation:
        "The uploaded image exhibits marked ill-defined erythematous lichenified plaques with pronounced superficial excoriation on the flexural antecubital surface. Accompanied by chronic pruritus, personal allergic rhinitis, and family atopy history, the clinical picture strongly aligns with atopic dermatitis (eczema).",
      status: ScanStatus.REVIEWED,
      createdAt: new Date("2026-08-20T10:15:00Z"),
      recommendation: {
        create: {
          condition: ScanCondition.ECZEMA,
          careAdvice:
            "Maintain twice-daily barrier replenishment with fragrance-free emollient ointment immediately after bathing. Minimize hot showers and harsh soaps. Use cold compresses to alleviate intense itch episodes and consult your clinic for topical prescription management.",
          disclaimer:
            "This is not a definitive medical diagnosis. Please consult a dermatologist or qualified healthcare professional.",
        },
      },
      review: {
        create: {
          dermatologistId: doctorUser.id,
          verdict: ReviewVerdict.CONFIRMED,
          correctedCondition: null,
          recommendationOk: true,
          createdAt: new Date("2026-08-21T14:30:00Z"),
        },
      },
    },
  });

  // Scan 2: REVIEWED - CORRECTED (AI predicted Contact Dermatitis, Doctor corrected to Eczema)
  const scan2 = await prisma.scan.create({
    data: {
      id: "scan_sample_02",
      imageUrl: "/samples/lesion-contact-derm.svg",
      patientId: patientUser.id,
      aiCondition: ScanCondition.CONTACT_DERMATITIS,
      aiConfidenceScore: 0.81,
      aiExplanation:
        "Localized erythematous papules with mild scaling around the wrist. The AI provisionally identified this as allergic contact dermatitis from potential accessory friction. However, clinical history suggests chronic recurrent flexural flares.",
      status: ScanStatus.REVIEWED,
      createdAt: new Date("2026-08-25T11:00:00Z"),
      recommendation: {
        create: {
          condition: ScanCondition.CONTACT_DERMATITIS,
          careAdvice:
            "Cease suspected jewelry contact, wash gently, and apply cool compresses to calm localized inflammation.",
          disclaimer:
            "This is not a definitive medical diagnosis. Please consult a dermatologist or qualified healthcare professional.",
        },
      },
      review: {
        create: {
          dermatologistId: doctorUser.id,
          verdict: ReviewVerdict.CORRECTED,
          correctedCondition: ScanCondition.ECZEMA,
          recommendationOk: false,
          createdAt: new Date("2026-08-26T09:15:00Z"),
        },
      },
    },
  });

  // Scan 3: PENDING_REVIEW - Psoriasis
  const scan3 = await prisma.scan.create({
    data: {
      id: "scan_sample_03",
      imageUrl: "/samples/lesion-psoriasis.svg",
      patientId: patientUser.id,
      aiCondition: ScanCondition.PSORIASIS,
      aiConfidenceScore: 0.88,
      aiExplanation:
        "Well-demarcated raised salmon-colored plaques capped by thick silvery-white lamellar scales localized over the extensor elbow. Minimal itch reported with absence of acute exudation. Morphology is typical of plaque psoriasis.",
      status: ScanStatus.PENDING_REVIEW,
      createdAt: new Date("2026-09-02T16:45:00Z"),
      recommendation: {
        create: {
          condition: ScanCondition.PSORIASIS,
          careAdvice:
            "Apply dense moisturizers or urea-based emollients to soften thick scale without forceful debridement. Avoid mechanical irritation or aggressive scratching. Awaiting dermatologist review.",
          disclaimer:
            "This is not a definitive medical diagnosis. Please consult a dermatologist or qualified healthcare professional.",
        },
      },
    },
  });

  // Scan 4: PENDING_REVIEW - Fungal Infection
  const scan4 = await prisma.scan.create({
    data: {
      id: "scan_sample_04",
      imageUrl: "/samples/lesion-fungal.svg",
      patientId: patientUser.id,
      aiCondition: ScanCondition.FUNGAL_INFECTION,
      aiConfidenceScore: 0.79,
      aiExplanation:
        "Annular erythematous lesion with an elevated vesicular active advancing periphery and relative central clearance on the lower abdomen. Morphology is suspicious for tinea corporis.",
      status: ScanStatus.PENDING_REVIEW,
      createdAt: new Date("2026-09-04T08:20:00Z"),
      recommendation: {
        create: {
          condition: ScanCondition.FUNGAL_INFECTION,
          careAdvice:
            "Keep the affected skin thoroughly dry. Avoid sharing towels or personal items. Awaiting specialist clinician evaluation.",
          disclaimer:
            "This is not a definitive medical diagnosis. Please consult a dermatologist or qualified healthcare professional.",
        },
      },
    },
  });

  // Add initial notifications and audit logs for realistic data
  await prisma.notification.createMany({
    data: [
      {
        userId: patientUser.id,
        title: "Scan #scan_sample_01 verified by Dr. Emmanuel Mugabo",
        read: true,
        createdAt: new Date("2026-08-21T14:30:00Z"),
      },
      {
        userId: patientUser.id,
        title: "Scan #scan_sample_02 review updated: verdict Corrected",
        read: false,
        createdAt: new Date("2026-08-26T09:15:00Z"),
      },
      {
        userId: patientUser.id,
        title: "Scan #scan_sample_03 submitted for clinical review",
        read: false,
        createdAt: new Date("2026-09-02T16:45:00Z"),
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: "SYSTEM_INITIALIZED",
        ipAddress: "127.0.0.1",
        createdAt: new Date("2026-08-01T08:00:00Z"),
      },
      {
        userId: adminUser.id,
        action: "VERIFY_DERMATOLOGIST_APPROVED (Dr. Emmanuel Mugabo)",
        ipAddress: "197.243.22.10",
        createdAt: new Date("2024-01-15T08:30:00Z"),
      },
      {
        userId: doctorUser.id,
        action: "REVIEW_SCAN_CONFIRMED (#scan_sample_01)",
        ipAddress: "197.243.22.45",
        createdAt: new Date("2026-08-21T14:30:00Z"),
      },
      {
        userId: doctorUser.id,
        action: "REVIEW_SCAN_CORRECTED (#scan_sample_02)",
        ipAddress: "197.243.22.45",
        createdAt: new Date("2026-08-26T09:15:00Z"),
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Seeded Credentials:");
  console.log("  Admin:         admin@eczemascan.rw  / AdminPass123!");
  console.log("  Dermatologist: doctor@eczemascan.rw / DoctorPass123!");
  console.log("  Patient:       patient@eczemascan.rw / PatientPass123!");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
