"use client";

import { format } from "date-fns";
import { Eye, AlertTriangle, Clock, User, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanStatus } from "@prisma/client";
import Image from "next/image";

interface ScansQueueProps {
  scans: {
    id: string;
    imageUrl: string;
    aiCondition: string;
    aiConfidenceScore: number;
    aiExplanation: string;
    status: ScanStatus;
    createdAt: Date;
    patient: {
      name: string;
      patientProfile: {
        dateOfBirth: Date | null;
        sex: string | null;
        location: string | null;
      } | null;
    };
    recommendation?: { condition: string; careAdvice: string } | null;
  }[];
}

const statusConfig: Record<
  ScanStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "info";
  }
> = {
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  REVIEWED: { label: "Reviewed", variant: "success" },
  FLAGGED: { label: "Flagged", variant: "destructive" },
};

const conditionLabels: Record<string, string> = {
  ECZEMA: "Eczema (Atopic Dermatitis)",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

export default function ScansQueue({ scans }: ScansQueueProps) {
  if (scans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            No Pending Scans
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            All scans have been reviewed. Check back later for new submissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Review Queue
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {scans.length} scan{scans.length !== 1 ? "s" : ""} awaiting
          dermatologist review
        </p>
      </div>

      <div className="space-y-4">
        {scans.map((scan) => {
          const statusInfo = statusConfig[scan.status];
          const age = scan.patient.patientProfile?.dateOfBirth
            ? Math.floor(
                (Date.now() -
                  new Date(scan.patient.patientProfile.dateOfBirth).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000),
              )
            : "Unknown";

          return (
            <Card key={scan.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 shrink-0">
                  <Link href={`/doctor/scans/${scan.id}/review`}>
                    <Image
                      src={scan.imageUrl}
                      alt={`Scan ${scan.id}`}
                      width={800}
                      height={600}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </Link>
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Link
                        href={`/doctor/scans/${scan.id}/review`}
                        className="block"
                      >
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400">
                          {conditionLabels[scan.aiCondition] ||
                            scan.aiCondition}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        AI Confidence:{" "}
                        <span className="font-medium">
                          {Math.round(scan.aiConfidenceScore * 100)}%
                        </span>
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {scan.patient.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Age: {age}
                    </span>
                    {scan.patient.patientProfile?.sex && (
                      <span className="flex items-center gap-1">
                        {scan.patient.patientProfile.sex}
                      </span>
                    )}
                    {scan.patient.patientProfile?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {scan.patient.patientProfile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(scan.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  <Link
                    href={`/doctor/scans/${scan.id}/review`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Review Scan
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
