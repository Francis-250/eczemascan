"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setCode((prev) => {
      const updated = [...prev];
      updated[index] = digit;
      return updated;
    });
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      const previousInput = document.getElementById(
        `code-${index - 1}`,
      ) as HTMLInputElement | null;

      previousInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await (authClient as any).emailOtp.verifyEmail({
        email,
        otp,
      });

      if (res.error) {
        setError(res.error.message || "Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Email verified successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/patient/scans";
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to verify code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing.");
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const res = await (authClient as any).emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (res.error) {
        setError(res.error.message || "Failed to resend code.");
      } else {
        setSuccessMessage("A new verification code has been dispatched to your email.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Verify your email
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            {email ? (
              <>
                Enter the 6-digit verification code sent to{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
              </>
            ) : (
              "Enter the 6-digit verification code sent to your email."
            )}
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                aria-label={`Verification code digit ${index + 1}`}
                onChange={(event) => {
                  handleChange(index, event.target.value);

                  if (event.target.value && index < 5) {
                    const nextInput = document.getElementById(
                      `code-${index + 1}`,
                    ) as HTMLInputElement | null;

                    nextInput?.focus();
                  }
                }}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-12 w-10 rounded-md border border-slate-300 bg-white text-center text-lg font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:w-12"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.some((d) => !d)}
            className="w-full rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Verifying..." : "Verify code"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Didn&apos;t receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="mt-2 text-sm font-medium text-blue-700 hover:underline dark:text-blue-500 disabled:opacity-50"
          >
            {isResending ? "Resending code..." : "Resend code"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-500"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
