import { Suspense } from "react";
import VerifyForm from "@/components/auth/verify-otp-form";

export default function VerifyPage() {
  return (
    <div className="w-full px-4 py-10 md:px-8">
      <Suspense fallback={<div className="text-center py-10 text-sm text-slate-500">Loading verification form...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
