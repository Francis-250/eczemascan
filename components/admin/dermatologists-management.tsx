"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Filter, CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

const STATUS_OPTIONS: { value: VerificationStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function DermatologistsManagement({ dermatologists, total, page, totalPages, status }: DermatologistsManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;
    const params = new URLSearchParams();
    if (newStatus) params.set("status", newStatus);
    router.push(`/admin/dermatologists?${params.toString()}`);
  };

  const handleVerify = async (dermatologistId: string, newStatus: VerificationStatus) => {
    setVerifyingIds((prev) => new Set(prev).add(dermatologistId));
    try {
      await verifyDermatologist(dermatologistId, newStatus);
      router.refresh();
    } catch {
      alert("Failed to update verification status");
    } finally {
      setVerifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(dermatologistId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dermatologist Verification</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {total} dermatologist{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
            <Select name="status" onValueChange={() => {}} defaultValue={status || ""}>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dermatologist</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dermatologists.map((derm) => (
                  <TableRow key={derm.id}>
                    <TableCell>
                      <div>
                        <Link href={`/admin/dermatologists/${derm.id}/verify`} className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600">
                          Dr. {derm.user.name}
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{derm.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{derm.licenseNumber}</TableCell>
                    <TableCell>{derm.specialty || "-"}</TableCell>
                    <TableCell>{derm.hospitalAffiliation || "-"}</TableCell>
                    <TableCell>{derm.yearsOfExperience ? `${derm.yearsOfExperience} yrs` : "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          derm.verificationStatus === "APPROVED" ? "success"
                          : derm.verificationStatus === "PENDING" ? "warning"
                          : "destructive"
                        }
                      >
                        {derm.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{derm._count.reviews}</TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(derm.user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleVerify(derm.id, "APPROVED")}
                            disabled={verifyingIds.has(derm.id) || derm.verificationStatus === "APPROVED"}
                          >
                            {verifyingIds.has(derm.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Approve
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVerify(derm.id, "REJECTED")}
                            disabled={verifyingIds.has(derm.id) || derm.verificationStatus === "REJECTED"}
                            className="text-red-600"
                          >
                            {verifyingIds.has(derm.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dermatologists/${derm.id}/verify`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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