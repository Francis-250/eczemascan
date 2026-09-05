"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Shield, CheckCircle, XCircle, Loader2, UserCheck, ClipboardList, Activity, ScanEye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { verifyDermatologist } from "@/lib/actions/admin";
import { VerificationStatus } from "@prisma/client";

interface DermatologistVerifyDetailProps {
  dermatologist: {
    id: string;
    licenseNumber: string;
    specialty: string | null;
    hospitalAffiliation: string | null;
    yearsOfExperience: number | null;
    bio: string | null;
    verificationStatus: VerificationStatus;
    verifiedAt: Date | null;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      role: string | null;
      banned: boolean | null;
      createdAt: Date;
      patientScans: {
        id: string;
        aiCondition: string;
        aiConfidenceScore: number;
        status: string;
        createdAt: Date;
        review: { verdict: string } | null;
      }[];
      auditLogs: {
        id: string;
        action: string;
        ipAddress: string | null;
        createdAt: Date;
      }[];
    };
    reviews: {
      id: string;
      verdict: string;
      correctedCondition: string | null;
      recommendationOk: boolean;
      createdAt: Date;
      scan: {
        id: string;
        aiCondition: string;
        patient: { name: string };
      };
    }[];
  };
}

export default function DermatologistVerifyDetail({ dermatologist }: DermatologistVerifyDetailProps) {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (newStatus: VerificationStatus) => {
    setVerifying(true);
    try {
      await verifyDermatologist(dermatologist.id, newStatus);
      window.location.reload();
    } catch {
      alert("Failed to update verification status");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/dermatologists" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Dermatologists
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dr. {dermatologist.user.name}</h1>
            <p className="text-slate-600 dark:text-slate-400">{dermatologist.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                dermatologist.verificationStatus === "APPROVED" ? "success"
                : dermatologist.verificationStatus === "PENDING" ? "warning"
                : "destructive"
              }
              className="gap-1.5"
            >
              {dermatologist.verificationStatus === "APPROVED" && <CheckCircle className="h-3.5 w-3.5" />}
              {dermatologist.verificationStatus === "REJECTED" && <XCircle className="h-3.5 w-3.5" />}
              {dermatologist.verificationStatus === "PENDING" && <UserCheck className="h-3.5 w-3.5" />}
              {dermatologist.verificationStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Registered {format(new Date(dermatologist.user.createdAt), "MMM d, yyyy")}
            </span>
            {dermatologist.user.emailVerified && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Shield className="h-3.5 w-3.5" />
                Email Verified
              </span>
            )}
            {dermatologist.verificationStatus === "APPROVED" && dermatologist.verifiedAt && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified {format(new Date(dermatologist.verifiedAt), "MMM d, yyyy")}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {dermatologist.verificationStatus !== "APPROVED" && (
              <Button
                onClick={() => handleVerify("APPROVED")}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            )}
            {dermatologist.verificationStatus !== "REJECTED" && (
              <Button
                variant="destructive"
                onClick={() => handleVerify("REJECTED")}
                disabled={verifying}
              >
                {verifying ? (
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
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">License Number</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50 font-mono">{dermatologist.licenseNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Specialty</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{dermatologist.specialty || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Hospital Affiliation</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{dermatologist.hospitalAffiliation || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Years of Experience</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{dermatologist.yearsOfExperience ? `${dermatologist.yearsOfExperience} years` : "Not set"}</dd>
              </div>
            </dl>
            {dermatologist.bio && (
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
                <dt className="text-slate-500 dark:text-slate-400 text-sm">Bio</dt>
                <dd className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{dermatologist.bio}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Role</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  <Badge variant={dermatologist.user.role === "ADMIN" ? "default" : "info"}>
                    {dermatologist.user.role || "DERMATOLOGIST"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  <Badge variant={dermatologist.user.banned ? "destructive" : "success"}>
                    {dermatologist.user.banned ? "Banned" : "Active"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Email Verified</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  {dermatologist.user.emailVerified ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Account Created</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  {format(new Date(dermatologist.user.createdAt), "MMM d, yyyy")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {dermatologist.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Reviews Completed ({dermatologist.reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Scan Condition</TableHead>
                    <TableHead>Verdict</TableHead>
                    <TableHead>Corrected To</TableHead>
                    <TableHead>Rec. OK</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dermatologist.reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.scan.patient.name}</TableCell>
                      <TableCell>{review.scan.aiCondition}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            review.verdict === "CONFIRMED" ? "success"
                            : review.verdict === "CORRECTED" ? "warning"
                            : "destructive"
                          }
                        >
                          {review.verdict}
                        </Badge>
                      </TableCell>
                      <TableCell>{review.correctedCondition || "-"}</TableCell>
                      <TableCell>
                        {review.recommendationOk ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(review.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {dermatologist.user.patientScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanEye className="h-5 w-5" />
              Patient Scans ({dermatologist.user.patientScans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AI Condition</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dermatologist.user.patientScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell>{scan.aiCondition}</TableCell>
                      <TableCell>{Math.round(scan.aiConfidenceScore * 100)}%</TableCell>
                      <TableCell>
                        <Badge variant={scan.status === "PENDING_REVIEW" ? "warning" : scan.status === "REVIEWED" ? "success" : "destructive"}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scan.review ? (
                          <Badge variant={scan.review.verdict === "CONFIRMED" ? "success" : "warning"}>
                            {scan.review.verdict}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(scan.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {dermatologist.user.auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Log ({dermatologist.user.auditLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dermatologist.user.auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.action}</TableCell>
                      <TableCell>{log.ipAddress || "Unknown"}</TableCell>
                      <TableCell>{format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}