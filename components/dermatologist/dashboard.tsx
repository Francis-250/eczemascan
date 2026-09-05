"use client";

import Link from "next/link";
import { ClipboardList, CheckCircle, AlertTriangle, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanStatus } from "@prisma/client";

interface DermatologistDashboardProps {
  pendingCount: number;
  reviewedCount: number;
  verificationStatus: string;
  recentScans: {
    id: string;
    imageUrl: string;
    aiCondition: string;
    aiConfidenceScore: number;
    status: ScanStatus;
    createdAt: Date;
    patient: { name: string; patientProfile: { dateOfBirth: Date | null } | null };
  }[];
}

const statusConfig: Record<ScanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  PENDING_REVIEW: { label: "Pending", variant: "warning" },
  REVIEWED: { label: "Reviewed", variant: "success" },
  FLAGGED: { label: "Flagged", variant: "destructive" },
};

const conditionLabels: Record<string, string> = {
  ECZEMA: "Eczema",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

function calculateAge(dateOfBirth: Date | null): string | number {
  if (!dateOfBirth) return "Unknown";
  const now = new Date();
  const birth = new Date(dateOfBirth);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function DermatologistDashboard({
  pendingCount,
  reviewedCount,
  verificationStatus,
  recentScans,
}: DermatologistDashboardProps) {
  const verificationBadge = {
    PENDING: { label: "Pending Verification", variant: "warning" as const },
    APPROVED: { label: "Verified Dermatologist", variant: "success" as const },
    REJECTED: { label: "Verification Rejected", variant: "destructive" as const },
  }[verificationStatus] ?? { label: verificationStatus, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Overview of your review queue and statistics.
          </p>
        </div>
        <Badge variant={verificationBadge.variant} className="text-sm">
          {verificationBadge.label}
        </Badge>
      </div>

      {verificationStatus !== "APPROVED" && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Account Pending Verification</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Your dermatologist account is awaiting admin approval. You cannot review scans until verified.
                  Please ensure your profile is complete with license information.
                </p>
                <Link href="/doctor/profile" className="mt-3 inline-block">
                  <Button size="sm">Complete Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Reviews</CardTitle>
            <ClipboardList className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{pendingCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scans awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{reviewedCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total reviews submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Verification Status</CardTitle>
            <User className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <Badge variant={verificationBadge.variant} className="text-base px-3 py-1">
              {verificationBadge.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Scans in Queue</CardTitle>
          <Link href="/doctor/scans" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            View All <ArrowRight className="h-3.5 w-3.5 ml-1 inline" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No pending scans in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => {
                const statusInfo = statusConfig[scan.status];
                const age = calculateAge(scan.patient.patientProfile?.dateOfBirth ?? null);

                return (
                  <Link
                    key={scan.id}
                    href={`/doctor/scans/${scan.id}/review`}
                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <img
                      src={scan.imageUrl}
                      alt={`Scan ${scan.id}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-50 truncate">
                        {conditionLabels[scan.aiCondition] || scan.aiCondition}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Patient: {scan.patient.name} • Age: {age} • Confidence: {Math.round(scan.aiConfidenceScore * 100)}%
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}