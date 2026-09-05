"use client";

import Link from "next/link";
import { Users, ClipboardList, UserCheck, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  totalScans: number;
  pendingReviews: number;
  activeUsers: number;
  pendingDermatologists: number;
  modelAccuracy: number;
}

const stats = [
  {
    name: "Total Scans",
    value: 0,
    icon: Activity,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "Pending Reviews",
    value: 0,
    icon: ClipboardList,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    name: "Active Users",
    value: 0,
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    name: "Pending Dermatologists",
    value: 0,
    icon: UserCheck,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
] as const;

export default function AdminDashboard({
  totalScans,
  pendingReviews,
  activeUsers,
  pendingDermatologists,
  modelAccuracy,
}: AdminDashboardProps) {
  const statValues = [totalScans, pendingReviews, activeUsers, pendingDermatologists];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          System overview and key metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {statValues[index].toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Accuracy</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {modelAccuracy.toFixed(1)}%
                </p>
              </div>
              <div className="text-4xl font-bold text-green-600">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Based on dermatologist corrections vs AI predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/dermatologists" className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
              <p className="font-medium text-slate-900 dark:text-slate-50">Verify Dermatologists</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review pending applications</p>
            </Link>
            <Link href="/admin/users" className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
              <p className="font-medium text-slate-900 dark:text-slate-50">Manage Users</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all users</p>
            </Link>
            <Link href="/admin/care-guidelines" className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
              <p className="font-medium text-slate-900 dark:text-slate-50">Care Guidelines</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage condition-specific advice</p>
            </Link>
            <Link href="/admin/support-tickets" className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
              <p className="font-medium text-slate-900 dark:text-slate-50">Support Tickets</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">View and resolve tickets</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}