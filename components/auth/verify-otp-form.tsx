"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

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

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <img
              src="https://readymadeui.com/logo-alt.svg"
              alt="SkinAI logo"
              className="h-12 w-12"
            />
          </Link>
        </div>

        <div className="text-center">
          <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Verify your email
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter the 6-digit verification code sent to your email.
          </p>
        </div>

        <form className="mt-10 space-y-6">
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
            className="w-full rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Verify code
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Didn't receive the code?
          </p>

          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue-700 hover:underline dark:text-blue-500"
          >
            Resend code
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
