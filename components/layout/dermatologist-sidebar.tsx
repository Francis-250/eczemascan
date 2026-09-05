"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  History,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { name: "Dashboard", href: "/dermatologist/dashboard", icon: LayoutDashboard },
  { name: "Review Queue", href: "/dermatologist/scans", icon: ClipboardList },
  { name: "My Reviews", href: "/dermatologist/reviews", icon: History },
  { name: "Profile", href: "/dermatologist/profile", icon: User },
  { name: "Support", href: "/dermatologist/support", icon: HelpCircle },
];

export default function DermatologistSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-neutral-800">
          {!collapsed && (
            <Link href="/dermatologist/dashboard" className="font-semibold text-lg text-slate-900 dark:text-slate-50">
              EczemaScan Doctor
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-neutral-800 dark:text-slate-400 dark:hover:text-slate-50"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-slate-50"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-neutral-800">
          {!collapsed ? (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="mx-auto p-2.5 rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-900/20"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {navigation.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.name ||
              "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}