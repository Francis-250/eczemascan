"use client";

import { useState } from "react";
import { Shield, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

interface AdminProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    role?: string | null;
    createdAt: Date;
  };
}

export default function AdminProfile({ user }: AdminProfileProps) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authClient.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your administrator account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full" />
              ) : (
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{user.name}</h2>
              <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-neutral-700">
            <div>
              <dt className="text-slate-500 dark:text-slate-400 text-sm">Role</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                <Badge variant="default">{user.role || "ADMIN"}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400 text-sm">Email Verified</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                {user.emailVerified ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400 text-sm">Member Since</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-50">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">Administrator Access</p>
              <p>
                You have full administrative access to the EczemaScan system including user management,
                dermatologist verification, care guidelines, support tickets, and audit logs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={handleSignOut} disabled={signingOut} className="w-full">
            {signingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing out...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Sign Out
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}