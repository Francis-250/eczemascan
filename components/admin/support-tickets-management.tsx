"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Filter, Loader2, Mail, CheckCircle, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { assignSupportTicket, resolveSupportTicket } from "@/lib/actions/admin";

interface SupportTicketsManagementProps {
  tickets: {
    id: string;
    subject: string;
    resolved: boolean;
    createdAt: Date;
    patient: { name: string; email: string };
    handledBy: { name: string; email: string } | null;
  }[];
  total: number;
  page: number;
  totalPages: number;
  status?: "OPEN" | "RESOLVED";
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
];

export default function SupportTicketsManagement({ tickets, total, page, totalPages, status }: SupportTicketsManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assigningIds, setAssigningIds] = useState<Set<string>>(new Set());
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;
    const params = new URLSearchParams();
    if (newStatus) params.set("status", newStatus);
    router.push(`/admin/support-tickets?${params.toString()}`);
  };

  const handleAssign = async (ticketId: string) => {
    setAssigningIds((prev) => new Set(prev).add(ticketId));
    try {
      await assignSupportTicket(ticketId);
      router.refresh();
    } catch {
      alert("Failed to assign ticket");
    } finally {
      setAssigningIds((prev) => {
        const next = new Set(prev);
        next.delete(ticketId);
        return next;
      });
    }
  };

  const handleResolve = async (ticketId: string) => {
    setResolvingIds((prev) => new Set(prev).add(ticketId));
    try {
      await resolveSupportTicket(ticketId);
      router.refresh();
    } catch {
      alert("Failed to resolve ticket");
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(ticketId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Support Tickets</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {total} ticket{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
            <Select name="status" onValueChange={() => {}} defaultValue={status || ""}>
              <SelectTrigger className="w-full sm:w-48">
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link href={`/admin/support-tickets/${ticket.id}`} className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600">
                        {ticket.subject}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">{ticket.patient.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{ticket.patient.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticket.resolved ? "success" : "warning"}>
                        {ticket.resolved ? "Resolved" : "Open"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.handledBy ? (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {ticket.handledBy.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/support-tickets/${ticket.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {!ticket.handledBy && !ticket.resolved && (
                            <DropdownMenuItem
                              onClick={() => handleAssign(ticket.id)}
                              disabled={assigningIds.has(ticket.id)}
                            >
                              {assigningIds.has(ticket.id) ? (
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
                            </DropdownMenuItem>
                          )}
                          {!ticket.resolved && (
                            <DropdownMenuItem
                              onClick={() => handleResolve(ticket.id)}
                              disabled={resolvingIds.has(ticket.id)}
                              className="text-green-600"
                            >
                              {resolvingIds.has(ticket.id) ? (
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
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No tickets found</p>
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
                    router.push(`/admin/support-tickets?${params.toString()}`);
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
                    router.push(`/admin/support-tickets?${params.toString()}`);
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