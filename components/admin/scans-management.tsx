"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ScanEye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanCondition, ScanStatus } from "@prisma/client";

interface AdminScansPageProps {
  scans: {
    id: string;
    imageUrl: string;
    aiCondition: ScanCondition;
    aiConfidenceScore: number;
    status: ScanStatus;
    createdAt: Date;
    patient: { name: string; email: string };
    recommendation: { condition: ScanCondition } | null;
    review: { verdict: string; dermatologist: { name: string } } | null;
  }[];
  total: number;
  page: number;
  totalPages: number;
}

const statusConfig: Record<ScanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  REVIEWED: { label: "Reviewed", variant: "success" },
  FLAGGED: { label: "Flagged", variant: "destructive" },
};

const conditionLabels: Record<ScanCondition, string> = {
  ECZEMA: "Eczema",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

export default function AdminScansPage({ scans, total, page, totalPages }: AdminScansPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">All Scans (QA/Oversight)</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {total} scan{total !== 1 ? "s" : ""} total • System-wide view for quality assurance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanEye className="h-5 w-5" />
            System-wide Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>AI Condition</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review Verdict</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => {
                  const statusInfo = statusConfig[scan.status];
                  return (
                    <TableRow key={scan.id}>
                      <TableCell>
                        <Link href={`/patient/scans/${scan.id}`} className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600">
                          {scan.patient.name}
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{scan.patient.email}</p>
                      </TableCell>
                      <TableCell>{conditionLabels[scan.aiCondition]}</TableCell>
                      <TableCell>{Math.round(scan.aiConfidenceScore * 100)}%</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {scan.review ? (
                          <Badge
                            variant={
                              scan.review.verdict === "CONFIRMED" ? "success"
                              : scan.review.verdict === "CORRECTED" ? "warning"
                              : "destructive"
                            }
                          >
                            {scan.review.verdict}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(scan.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patient/scans/${scan.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {scans.length === 0 && (
            <div className="text-center py-8">
              <ScanEye className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No scans found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages} • {total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(page - 1));
                    router.push(`/admin/scans?${params.toString()}`);
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(page + 1));
                    router.push(`/admin/scans?${params.toString()}`);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}