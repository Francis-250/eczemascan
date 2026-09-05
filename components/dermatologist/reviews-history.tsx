"use client";

import { format } from "date-fns";
import { Eye, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewVerdict, ScanCondition } from "@prisma/client";
import Image from "next/image";

interface ReviewsHistoryProps {
  reviews: {
    id: string;
    verdict: ReviewVerdict;
    correctedCondition: ScanCondition | null;
    recommendationOk: boolean;
    createdAt: Date;
    scan: {
      id: string;
      imageUrl: string;
      aiCondition: ScanCondition;
      aiConfidenceScore: number;
      patient: { name: string };
      recommendation?: { condition: ScanCondition } | null;
    };
  }[];
}

const verdictConfig: Record<
  ReviewVerdict,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "success"
      | "warning"
      | "info";
    icon: React.ReactNode;
  }
> = {
  CONFIRMED: {
    label: "Confirmed",
    variant: "success",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  CORRECTED: {
    label: "Corrected",
    variant: "warning",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  INCONCLUSIVE: {
    label: "Inconclusive",
    variant: "destructive",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const conditionLabels: Record<ScanCondition, string> = {
  ECZEMA: "Eczema",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

export default function ReviewsHistory({ reviews }: ReviewsHistoryProps) {
  if (reviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            No Reviews Yet
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You haven&apos;t completed any reviews yet. Visit the Review Queue
            to get started.
          </p>
          <Link href="/doctor/scans" className="mt-4 inline-block">
            <button className="px-4 py-2 rounded-md border border-blue-600 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Go to Review Queue
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          My Reviews
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} completed
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const verdictInfo = verdictConfig[review.verdict];

          return (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="md:w-32 shrink-0">
                    <Link href={`/doctor/scans/${review.scan.id}/review`}>
                      <Image
                        src={review.scan.imageUrl}
                        alt={`Scan ${review.scan.id}`}
                        width={400}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/doctor/scans/${review.scan.id}/review`}
                        className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600"
                      >
                        {conditionLabels[review.scan.aiCondition]}
                      </Link>
                      <Badge variant={verdictInfo.variant} className="gap-1">
                        {verdictInfo.icon}
                        {verdictInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Patient: {review.scan.patient.name} • AI Confidence:{" "}
                      {Math.round(review.scan.aiConfidenceScore * 100)}%
                    </p>
                    {review.correctedCondition && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Corrected to:{" "}
                        <span className="font-medium">
                          {conditionLabels[review.correctedCondition]}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      {review.recommendationOk ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          Rec. OK
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          Rec. Not OK
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
