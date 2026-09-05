"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, PlusCircle, History, Bell, User, HelpCircle } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";

const navItems = [
  { name: "My Scans", href: "/patient/scans", icon: History },
  { name: "New Scan", href: "/patient/scan/new", icon: PlusCircle },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
  { name: "Profile", href: "/patient/profile", icon: User },
  { name: "Support", href: "/patient/support", icon: HelpCircle },
];

export default function PatientHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/patient/scans" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <HeartPulse className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Eczema<span className="text-blue-600 dark:text-blue-400">Scan</span>
          </span>
          <span className="hidden sm:inline-block ml-1 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">
            Patient Portal
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/patient/scans" && pathname.startsWith("/patient/scans/"));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-slate-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}

          <div className="ml-2 pl-2 border-l border-slate-200 dark:border-neutral-800">
            <LogoutButton variant="ghost" size="sm" className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30" />
          </div>
        </nav>
      </div>
    </header>
  );
}
