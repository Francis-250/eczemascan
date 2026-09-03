"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    console.log({
      name,
      email,
      password,
      confirmPassword,
      agreeToTerms,
    });
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
            Create an account
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create your account to get started with SkinAI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 inline-block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              Full name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              required
              className="w-full rounded-md bg-white px-3 py-2.5 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
            />
          </div>

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
            <label
              htmlFor="password"
              className="mb-2 inline-block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              Password
            </label>

            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full rounded-md bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
              />

              <button
                type="button"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 inline-block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                type={isConfirmVisible ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full rounded-md bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
              />

              <button
                type="button"
                onClick={() => setIsConfirmVisible((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={
                  isConfirmVisible ? "Hide password" : "Show password"
                }
              >
                {isConfirmVisible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                Passwords do not match.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={password !== confirmPassword || !agreeToTerms}
            className="w-full rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-900 dark:text-slate-50">
          Already have an account?
          <Link
            href="/auth/login"
            className="ml-1 font-medium text-blue-700 hover:underline dark:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
