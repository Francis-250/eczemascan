"use client";

import { format } from "date-fns";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Info, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanCondition, ScanStatus, ReviewVerdict } from "@prisma/client";

interface ScanDetailProps {
  scan: {
    id: string;
    imageUrl: string;
    aiCondition: ScanCondition;
    aiConfidenceScore: number;
    aiExplanation: string;
    status: ScanStatus;
    createdAt: Date;
    recommendation?: {
      condition: ScanCondition;
      careAdvice: string;
      disclaimer: string;
    } | null;
    review?: {
      verdict: ReviewVerdict;
      correctedCondition: ScanCondition | null;
      recommendationOk: boolean;
      createdAt: Date;
      dermatologist: { name: string; dermatologistProfile: { specialty: string | null } | null } | null;
    } | null;
    patient: { name: string; patientProfile: { dateOfBirth: Date | null; sex: string | null } | null };
  };
}

const conditionLabels: Record<ScanCondition, string> = {
  ECZEMA: "Eczema (Atopic Dermatitis)",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

const statusConfig: Record<ScanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info"; icon: React.ReactNode }> = {
  PENDING_REVIEW: { label: "Pending Review", variant: "warning", icon: <Clock className="h-3.5 w-3.5" /> },
  REVIEWED: { label: "Reviewed", variant: "success", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  FLAGGED: { label: "Flagged", variant: "destructive", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const verdictConfig: Record<ReviewVerdict, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info"; description: string }> = {
  CONFIRMED: { label: "Confirmed", variant: "success", description: "The dermatologist agrees with the AI prediction." },
  CORRECTED: { label: "Corrected", variant: "warning", description: "The dermatologist corrected the AI prediction." },
  INCONCLUSIVE: { label: "Inconclusive", variant: "destructive", description: "The dermatologist could not reach a definitive conclusion." },
};

export default function ScanDetail({ scan }: ScanDetailProps) {
  const statusInfo = statusConfig[scan.status];
  const isReviewed = scan.status === ScanStatus.REVIEWED || scan.status === ScanStatus.FLAGGED;
  const verdictInfo = scan.review ? verdictConfig[scan.review.verdict] : null;

  return (
    <div className="space-y-6">
      <Link href="/patient/scans" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Scans
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lesion Image</CardTitle>
              <Badge variant={statusInfo.variant} className="gap-1.5">
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <img
                src={scan.imageUrl}
                alt={`Scan ${scan.id}`}
                className="w-full aspect-[4/3] object-cover"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Shield className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Provisional AI Prediction</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      This result has not been verified by a dermatologist.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">AI Predicted Condition</label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">
                    {conditionLabels[scan.aiCondition]}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">Confidence Score</label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">
                    {Math.round(scan.aiConfidenceScore * 100)}%
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">AI Clinical Explanation</label>
                <p className="mt-2 p-4 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {scan.aiExplanation}
                </p>
              </div>
            </CardContent>
          </Card>

          {scan.recommendation && (
            <Card>
              <CardHeader>
                <CardTitle>Care Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-green-700 dark:text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">Non-Diagnostic Disclaimer</p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {scan.recommendation.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">Condition-Specific Care Advice</label>
                  <p className="mt-2 p-4 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {scan.recommendation.careAdvice}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isReviewed && scan.review && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Dermatologist Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">Verified Result</p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        This result has been reviewed and confirmed by a licensed dermatologist.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Dermatologist Verdict</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={verdictInfo?.variant}>{verdictInfo?.label}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Reviewed By</label>
                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                      Dr. {scan.review.dermatologist?.name}
                      {scan.review.dermatologist?.dermatologistProfile?.specialty && (
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                          ({scan.review.dermatologist.dermatologistProfile.specialty})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Review Date</label>
                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                      {format(new Date(scan.review.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  {scan.review.correctedCondition && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500 dark:text-slate-400">Corrected Condition</label>
                      <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                        {conditionLabels[scan.review.correctedCondition]}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-500 dark:text-slate-400">Recommendation Assessment</label>
                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                      {scan.review.recommendationOk ? "Appropriate" : "Not Appropriate"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {verdictInfo?.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isReviewed && scan.status === ScanStatus.PENDING_REVIEW && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Awaiting Dermatologist Review</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your scan is in the review queue. A licensed dermatologist will review the AI analysis
                      and provide a verified result. You will receive a notification once the review is complete.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Submitted</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {format(new Date(scan.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Patient</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{scan.patient.name}</dd>
                </div>
                {scan.patient.patientProfile?.dateOfBirth && (
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Age</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(scan.createdAt).getFullYear() - new Date(scan.patient.patientProfile!.dateOfBirth!).getFullYear()}
                    </dd>
                  </div>
                )}
                {scan.patient.patientProfile?.sex && (
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Sex</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{scan.patient.patientProfile.sex}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="relative pl-6 pb-4 border-l border-slate-200 dark:border-neutral-700 before:absolute before:left-[-6px] before:top-0 before:h-2 before:w-2 before:rounded-full before:bg-green-600">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Scan Submitted</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {format(new Date(scan.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </li>
                {isReviewed && scan.review && (
                  <li className="relative pl-6 pb-4 border-l border-slate-200 dark:border-neutral-700 before:absolute before:left-[-6px] before:top-0 before:h-2 before:w-2 before:rounded-full before:bg-green-600">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      Dermatologist Review: {verdictInfo?.label}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(scan.review.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </li>
                )}
                {!isReviewed && (
                  <li className="relative pl-6 border-l border-slate-200 dark:border-neutral-700 before:absolute before:left-[-6px] before:top-0 before:h-2 before:w-2 before:rounded-full before:bg-amber-600 animate-pulse">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Awaiting Review</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">In queue for dermatologist review</p>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}