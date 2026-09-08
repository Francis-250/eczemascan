import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP, phoneNumber } from "better-auth/plugins";

import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { nextCookies } from "better-auth/next-js";
import { sendEmailOrThrow } from "./brevo";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: { create: { before: async (user, context) => ({
      data: { ...user, role: context?.headers?.get("x-registration-role") === "DERMATOLOGIST" ? "DERMATOLOGIST" : "PATIENT" },
    }) } },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await sendEmailOrThrow({
        to: user.email,
        subject: "Reset Your Password",
        text: `Reset your EczemaScan password using this link: ${url}. If you did not request this, ignore this email.`,
        html: `<p>Reset your EczemaScan password:</p><p><a href="${url.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`,
      });
    },
  },
  emailVerification: { sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: false },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  appName: "EczemaScan",
  plugins: [
    admin({
      defaultRole: "PATIENT",
      adminRoles: ["ADMIN"],
      roles: { ADMIN: adminAc, PATIENT: userAc, DERMATOLOGIST: userAc },
    }),
    phoneNumber(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 600,
      resendStrategy: "rotate",
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "email-verification") {
          await sendEmailOrThrow({
            to: email,
            subject: `${otp} is your EczemaScan verification code`,
            text: `Your EczemaScan verification code is ${otp}. It expires in 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify your EczemaScan email</h2>
                <p>This code was requested for <strong>${email}</strong>.</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <code style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</code>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <hr style="margin: 20px 0;" />
                <p style="color: #6b7280; font-size: 12px;">EczemaScan</p>
              </div>
            `,
          });
        } else if (type === "sign-in") {
          await sendEmailOrThrow({
            to: email,
            subject: "Your OTP for Sign-In",
            text: `Your EczemaScan sign-in code is ${otp}.`,
            html: `<p>Your OTP for sign-in is: <strong>${otp}</strong></p>`,
          });
        } else {
          await sendEmailOrThrow({
            to: email,
            subject: "Your OTP Code",
            text: `Your EczemaScan OTP code is ${otp}.`,
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
          });
        }
      },
    }),
    nextCookies(),
  ],
});
