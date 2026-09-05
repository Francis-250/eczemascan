import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="w-full px-4 py-10 md:px-8">
      <Suspense fallback={<div className="text-center py-10 text-sm text-slate-500">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}