"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { verifyDermatologist } from "@/lib/actions/admin";
import { VerificationStatus } from "@prisma/client";

interface DermatologistsManagementProps {
  dermatologists: {
    id: string;
    licenseNumber: string;
    specialty: string | null;
    hospitalAffiliation: string | null;
    yearsOfExperience: number | null;
    verificationStatus: VerificationStatus;
    verifiedAt: Date | null;
    createdAt: Date;
    user: { id: string; name: string; email: string; createdAt: Date; banned: boolean };
    _count: { reviews: number };
  }[];
  total: number;
  page: number;
  totalPages: number;
  status?: VerificationStatus;
}

const STATUS_OPTIONS: { value: VerificationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function DermatologistsManagement({ dermatologists, total, page, totalPages, status }: DermatologistsManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;
    const params = new URLSearchParams();
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    router.push(`/admin/dermatologists?${params.toString()}`);
  };

  const handleVerify = async (dermatologistId: string, newStatus: VerificationStatus) => {
    setFeedback(null);
    setVerifyingIds((prev) => new Set(prev).add(dermatologistId));
    try {
      const result = await verifyDermatologist(dermatologistId, newStatus);
      if (result.error) { setFeedback(result.error); return; }
      setFeedback(newStatus === "APPROVED" ? "Dermatologist approved." : "Dermatologist rejected.");
      router.refresh();
    } catch {
      setFeedback("Failed to update verification status");
    } finally {
      setVerifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(dermatologistId);
        return next;
      });
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dermatologist Verification</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {total} dermatologist{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {feedback && <p role="status" className="rounded border p-3">{feedback}</p>}
      <Card>
        <CardHeader>
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
            <Select name="status" onValueChange={() => {}} defaultValue={status || "ALL"}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%] px-1 sm:px-3">Name</TableHead>
                  <TableHead className="w-[25%] px-1 sm:px-3">Status</TableHead>
                  <TableHead className="w-[40%] px-1 text-right sm:px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dermatologists.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-slate-500">No dermatologists found.</TableCell></TableRow>}
                {dermatologists.map((derm) => (
                  <TableRow key={derm.id}>
                    <TableCell className="px-1 py-3 sm:px-3">
                      <Link href={`/admin/dermatologists/${derm.id}/verify`} className="break-words [overflow-wrap:anywhere] font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600">
                        {derm.user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-1 py-3 sm:px-3">
                      <Badge className="max-w-full px-1 text-[10px] sm:px-2 sm:text-xs" variant={derm.verificationStatus === "APPROVED" ? "success" : derm.verificationStatus === "PENDING" ? "warning" : "destructive"}>
                        {derm.verificationStatus === "APPROVED" ? "Approved" : derm.verificationStatus === "PENDING" ? "Pending" : "Rejected"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-1 py-3 sm:px-3">
                      <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                      <Button size="sm" className="h-8 px-1 sm:px-2" aria-label={`Approve ${derm.user.name}`} title="Approve" disabled={verifyingIds.has(derm.id) || derm.verificationStatus === "APPROVED"} onClick={() => handleVerify(derm.id, "APPROVED")}>
                        {verifyingIds.has(derm.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}<span className="hidden lg:inline">Approve</span>
                      </Button>


                      <Button size="sm" variant="outline" className="h-8 px-1 sm:px-2" aria-label={`Reject ${derm.user.name}`} title="Reject" disabled={verifyingIds.has(derm.id) || derm.verificationStatus === "REJECTED"} onClick={() => handleVerify(derm.id, "REJECTED")}>
                        <XCircle className="h-4 w-4" /><span className="hidden lg:inline">Reject</span>
                      </Button>


                      <Button size="sm" variant="ghost" className="h-8 px-1 text-xs sm:px-2" asChild><Link aria-label={`View ${derm.user.name}`} href={`/admin/dermatologists/${derm.id}/verify`}>View</Link></Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
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
                    router.push(`/admin/dermatologists?${params.toString()}`);
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
                    router.push(`/admin/dermatologists?${params.toString()}`);
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