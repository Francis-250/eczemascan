"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search, Filter, Ban, UserX, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toggleUserBan } from "@/lib/actions/admin";

interface UsersManagementProps {
  users: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    createdAt: Date;
    patientProfile: { id: string } | null;
    dermatologistProfile: { id: string; verificationStatus: string } | null;
    _count: { patientScans: number; supportTickets: number };
  }[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  role: string;
}

const ROLES = ["PATIENT", "DERMATOLOGIST", "ADMIN"];

export default function UsersManagement({ users, total, page, totalPages, search, role }: UsersManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [banningIds, setBanningIds] = useState<Set<string>>(new Set());

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSearch = formData.get("search") as string;
    const newRole = formData.get("role") as string;
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newRole) params.set("role", newRole);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    setBanningIds((prev) => new Set(prev).add(userId));
    try {
      const reason = currentlyBanned ? undefined : prompt("Enter ban reason (optional):") || undefined;
      await toggleUserBan(userId, !currentlyBanned, reason);
      router.refresh();
    } catch {
      alert("Failed to update user status");
    } finally {
      setBanningIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {total} user{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                value={search}
                className="pl-10"
              />
            </div>
            <Select name="role" onValueChange={() => {}} defaultValue={role}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Scans</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <Link href={`/admin/users/${user.id}`} className="font-medium text-slate-900 dark:text-slate-50 hover:text-blue-600">
                          {user.name}
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : user.role === "DERMATOLOGIST" ? "info" : "secondary"}>
                        {user.role || "PATIENT"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.banned ? "destructive" : "success"}>
                        {user.banned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                      {!user.dermatologistProfile && user.role !== "ADMIN" && (
                        <Badge variant="secondary">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{user._count.patientScans}</TableCell>
                    <TableCell className="text-right">{user._count.supportTickets}</TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBanToggle(user.id, user.banned ?? false)}
                            disabled={banningIds.has(user.id)}
                            className={user.banned ? "text-green-600" : "text-red-600"}
                          >
                            {banningIds.has(user.id) ? (
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
                    router.push(`/admin/users?${params.toString()}`);
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
                    router.push(`/admin/users?${params.toString()}`);
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