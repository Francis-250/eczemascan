import Link from "next/link";
import {
  HeartPulse,
  UploadCloud,
  Sparkles,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-neutral-950 dark:text-slate-100">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Eczema<span className="text-blue-600 dark:text-blue-400">Scan</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              How It Works
            </a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              About
            </a>
            <a href="#disclaimer" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Safety
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Clinical Decision Support • Rwanda</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI-Powered Skin Lesion Screening, Verified by Dermatologists
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Fast, accessible screening for atopic dermatitis and visually similar skin conditions.
              Designed for patients and frontline health workers in Rwanda.
            </p>

            {/* Non-Diagnostic Notice */}
            <div id="disclaimer" className="max-w-xl mx-auto rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-left text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Non-Diagnostic Notice:</strong> EczemaScan provides provisional screening to assist clinical triage.
                  All automated predictions require verification by a licensed medical specialist.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Start Screening
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6">
                  Clinician Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 border-b border-slate-200 dark:border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                How It Works
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                A simple 3-step screening and validation workflow.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
                <div className="h-10 w-10 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  1. Capture & Upload
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Take a photo of the skin lesion and answer a few brief symptom questions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
                <div className="h-10 w-10 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  2. AI Screening
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Receive an immediate provisional classification, confidence score, and care guidelines.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
                <div className="h-10 w-10 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  3. Doctor Review
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  A licensed dermatologist validates or corrects the prediction with personalized notes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights / About */}
        <section id="about" className="py-16 border-b border-slate-200 dark:border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Specialist Access
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Addresses critical dermatologist shortages in provincial Rwanda by providing frontline first-pass triage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                  <Users className="h-4 w-4 text-blue-600" />
                  Diverse Skin Tones
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Trained and evaluated on datasets reflecting diverse pigmentation (Fitzpatrick phototypes IV–VI).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Clinician in the Loop
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Built to assist, never replace, trained clinical practitioners. Final assessments remain with doctors.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 bg-white dark:bg-neutral-950 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-900 dark:text-white">EczemaScan</span>
            <span>— Clinical Decision Support for Skin Conditions</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/auth/login" className="hover:underline">
              Sign In
            </Link>
            <Link href="/auth/register" className="hover:underline">
              Register
            </Link>
            <span>© {new Date().getFullYear()} EczemaScan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
