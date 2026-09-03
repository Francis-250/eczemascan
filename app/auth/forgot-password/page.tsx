"use client";

import Link from "next/link";

export default function ForgotPasswordForm() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-700 dark:bg-neutral-800">
        {/* Logo */}
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
            Forgot your password?
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter your email and we'll send you a verification code to reset
            your password.
          </p>
        </div>

        <form className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 inline-block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="john@example.com"
              autoComplete="email"
              required
              className="w-full rounded-md bg-white px-3 py-2.5 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Send reset code
          </button>
        </form>

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
