"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Eye, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanCondition, ScanStatus } from "@prisma/client";

interface ScanWithRelations {
  id: string;
  imageUrl: string;
  aiCondition: ScanCondition;
  aiConfidenceScore: number;
  status: ScanStatus;
  createdAt: Date;
  recommendation?: {
    condition: ScanCondition;
    careAdvice: string;
    disclaimer: string;
  } | null;
  review?: {
    verdict: string;
    correctedCondition: ScanCondition | null;
    recommendationOk: boolean;
    dermatologist: { name: string } | null;
  } | null;
}

interface ScansListProps {
  scans: ScanWithRelations[];
}

const statusConfig: Record<ScanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  REVIEWED: { label: "Reviewed", variant: "success" },
  FLAGGED: { label: "Flagged", variant: "destructive" },
};

const conditionLabels: Record<ScanCondition, string> = {
  ECZEMA: "Eczema (Atopic Dermatitis)",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

export default function ScansList({ scans }: ScansListProps) {
  if (scans.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">No scans yet</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Start by uploading your first skin lesion photo for AI analysis.
        </p>
        <Link href="/patient/scan/new">
          <Button>Create New Scan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">My Scans</h1>
        <Link href="/patient/scan/new">
          <Button>New Scan</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scans.map((scan) => {
          const statusInfo = statusConfig[scan.status];
          const isReviewed = scan.status === ScanStatus.REVIEWED || scan.status === ScanStatus.FLAGGED;

          return (
            <Card key={scan.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <Link href={`/patient/scans/${scan.id}`} className="block">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={scan.imageUrl}
                    alt={`Scan ${scan.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-50 truncate">
                        {conditionLabels[scan.aiCondition]}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        AI Confidence: {Math.round(scan.aiConfidenceScore * 100)}%
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{format(new Date(scan.createdAt), "MMM d, yyyy")}</span>
                    {isReviewed && scan.review && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        Reviewed by Dr. {scan.review.dermatologist?.name}
                      </span>
                    )}
                  </div>

                  {isReviewed && scan.review && (
                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Verdict: <span className="font-medium capitalize">{scan.review.verdict.toLowerCase()}</span>
                        {scan.review.correctedCondition && (
                          <> → {conditionLabels[scan.review.correctedCondition]}</>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/patient/scans/${scan.id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}