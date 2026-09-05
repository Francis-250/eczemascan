"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, User, CheckCircle, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assignSupportTicket, resolveSupportTicket } from "@/lib/actions/admin";

interface SupportTicketDetailProps {
  ticket: {
    id: string;
    subject: string;
    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
    patient: {
      id: string;
      name: string;
      email: string;
      patientProfile: {
        dateOfBirth: Date | null;
        sex: string | null;
        location: string | null;
      } | null;
    };
    handledBy: { id: string; name: string; email: string } | null;
  };
}

function calculateAge(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;
  const now = new Date();
  const birth = new Date(dateOfBirth);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function SupportTicketDetail({ ticket }: SupportTicketDetailProps) {
  const [assigning, setAssigning] = useState(false);
  const [resolving, setResolving] = useState(false);

  const patientAge = calculateAge(ticket.patient.patientProfile?.dateOfBirth ?? null);

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await assignSupportTicket(ticket.id);
      window.location.reload();
    } catch {
      alert("Failed to assign ticket");
    } finally {
      setAssigning(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveSupportTicket(ticket.id);
      window.location.reload();
    } catch {
      alert("Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/support-tickets" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{ticket.subject}</h1>
              <Badge variant={ticket.resolved ? "success" : "warning"}>
                {ticket.resolved ? "Resolved" : "Open"}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Created {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            {ticket.handledBy ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Assigned to</p>
                  <p className="text-sm text-green-700 dark:text-green-300">{ticket.handledBy.name}</p>
                </div>
              </div>
            ) : (
              <Button onClick={handleAssign} disabled={assigning} variant="outline">
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Assign to Me
                  </>
                )}
              </Button>
            )}
            {!ticket.resolved && (
              <Button onClick={handleResolve} disabled={resolving} variant="default">
                {resolving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Name</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{ticket.patient.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{ticket.patient.email}</dd>
                  </div>
                  {ticket.patient.patientProfile?.dateOfBirth && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Age</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">
                        {patientAge}
                      </dd>
                    </div>
                  )}
                  {ticket.patient.patientProfile?.sex && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Sex</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{ticket.patient.patientProfile.sex}</dd>
                    </div>
                  )}
                  {ticket.patient.patientProfile?.location && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Location</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{ticket.patient.patientProfile.location}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      <Badge variant={ticket.resolved ? "success" : "warning"}>
                        {ticket.resolved ? "Resolved" : "Open"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Created</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Last Updated</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {format(new Date(ticket.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </dd>
                  </div>
                  {ticket.handledBy && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Handled By</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{ticket.handledBy.name}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}