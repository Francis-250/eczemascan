"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
            Welcome back
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter your email and password to sign in.
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              autoComplete="email"
              required
              className="w-full rounded-md bg-white px-3 py-2.5 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-900 dark:text-slate-50"
              >
                Password
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-md bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
              />

              <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                aria-label={isVisible ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:hover:text-slate-200"
              >
                {isVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.94 7.244 19 12 19c1.524 0 2.977-.326 4.29-.912M6.228 6.228A10.45 10.45 0 0112 5c4.756 0 8.774 3.06 10.066 7a10.45 10.45 0 01-4.066 5.772M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.879 9.879"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />

            <label
              htmlFor="remember"
              className="ml-3 text-sm text-slate-700 dark:text-slate-300"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Sign in
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <hr className="w-full border-slate-300 dark:border-neutral-700" />
          <span className="text-sm text-slate-500 dark:text-slate-400">or</span>
          <hr className="w-full border-slate-300 dark:border-neutral-700" />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-slate-50 dark:hover:bg-neutral-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-[18px] w-[18px]"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19.1-7.3 19.1-20 0-1.2-.1-2.3-.3-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.4-6.1 6.6l6.2 5.2C39 36.6 43.1 30.9 43.1 24c0-1.2-.1-2.3-.3-3.5z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-900 dark:text-slate-50">
          Don't have an account?
          <Link
            href="/auth/register"
            className="ml-1 font-medium text-blue-700 hover:underline dark:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
