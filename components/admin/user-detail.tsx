"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Shield, Ban, UserX, Loader2, ScanEye, MessageSquare, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toggleUserBan } from "@/lib/actions/admin";

interface UserDetailProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
    createdAt: Date;
    patientProfile: {
      dateOfBirth: Date | null;
      sex: string | null;
      skinType: string | null;
      allergyHistory: boolean;
      familyHistory: boolean;
      location: string | null;
    } | null;
    dermatologistProfile: {
      licenseNumber: string;
      specialty: string | null;
      hospitalAffiliation: string | null;
      yearsOfExperience: number | null;
      bio: string | null;
      verificationStatus: string;
      verifiedAt: Date | null;
    } | null;
    patientScans: {
      id: string;
      aiCondition: string;
      aiConfidenceScore: number;
      status: string;
      createdAt: Date;
      recommendation: { condition: string } | null;
      review: { verdict: string } | null;
    }[];
    supportTickets: {
      id: string;
      subject: string;
      resolved: boolean;
      createdAt: Date;
      handledBy: { name: string } | null;
    }[];
    auditLogs: {
      id: string;
      action: string;
      ipAddress: string | null;
      createdAt: Date;
    }[];
  };
}

export default function UserDetail({ user }: UserDetailProps) {
  const [banning, setBanning] = useState(false);

  const handleBanToggle = async () => {
    setBanning(true);
    try {
      const reason = user.banned ? undefined : prompt("Enter ban reason (optional):") || undefined;
      await toggleUserBan(user.id, !user.banned, reason);
      window.location.reload();
    } catch {
      alert("Failed to update user status");
    } finally {
      setBanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{user.name}</h1>
            <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "ADMIN" ? "default" : user.role === "DERMATOLOGIST" ? "info" : "secondary"}>
              {user.role || "PATIENT"}
            </Badge>
            <Badge variant={user.banned ? "destructive" : "success"}>
              {user.banned ? "Banned" : "Active"}
            </Badge>
            {user.dermatologistProfile && (
              <Badge
                variant={
                  user.dermatologistProfile.verificationStatus === "APPROVED" ? "success"
                  : user.dermatologistProfile.verificationStatus === "PENDING" ? "warning"
                  : "destructive"
                }
              >
                {user.dermatologistProfile.verificationStatus}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
            </span>
            {user.emailVerified && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Shield className="h-3.5 w-3.5" />
                Email Verified
              </span>
            )}
            {user.banned && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <Ban className="h-3.5 w-3.5" />
                Banned: {user.banReason || "No reason provided"}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={user.banned ? "default" : "destructive"} disabled={banning}>
                {banning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : user.banned ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Unban User
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBanToggle} disabled={banning}>
                {user.banned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {user.patientProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanEye className="h-5 w-5" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Date of Birth</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  {user.patientProfile.dateOfBirth ? format(new Date(user.patientProfile.dateOfBirth), "MMM d, yyyy") : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Sex</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.patientProfile.sex || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Skin Type</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.patientProfile.skinType || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Location</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.patientProfile.location || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Allergy History</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.patientProfile.allergyHistory ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Family History</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.patientProfile.familyHistory ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {user.dermatologistProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Dermatologist Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">License Number</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.dermatologistProfile.licenseNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Specialty</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.dermatologistProfile.specialty || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Hospital Affiliation</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.dermatologistProfile.hospitalAffiliation || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Years of Experience</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{user.dermatologistProfile.yearsOfExperience || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Verification Status</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">
                  <Badge
                    variant={
                      user.dermatologistProfile.verificationStatus === "APPROVED" ? "success"
                      : user.dermatologistProfile.verificationStatus === "PENDING" ? "warning"
                      : "destructive"
                    }
                  >
                    {user.dermatologistProfile.verificationStatus}
                  </Badge>
                </dd>
              </div>
              {user.dermatologistProfile.verifiedAt && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Verified At</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {format(new Date(user.dermatologistProfile.verifiedAt!), "MMM d, yyyy")}
                  </dd>
                </div>
              )}
            </dl>
            {user.dermatologistProfile.bio && (
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
                <dt className="text-slate-500 dark:text-slate-400 text-sm">Bio</dt>
                <dd className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{user.dermatologistProfile.bio}</dd>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {user.patientScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanEye className="h-5 w-5" />
              Recent Scans ({user.patientScans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Condition</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.patientScans.map((scan) => (
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

      {user.supportTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Support Tickets ({user.supportTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Handled By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.resolved ? "success" : "warning"}>
                          {ticket.resolved ? "Resolved" : "Open"}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.handledBy?.name || "Unassigned"}</TableCell>
                      <TableCell>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {user.auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Log ({user.auditLogs.length})
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
                  {user.auditLogs.map((log) => (
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