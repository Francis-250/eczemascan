"use client";

import { HelpCircle, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DermatologistSupport() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Support</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Get help with using the dermatologist dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
            <h3 className="font-medium text-slate-900 dark:text-slate-50 mb-2">Review Guidelines</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Review the AI prediction and patient context thoroughly</li>
              <li>Provide your clinical verdict: Confirmed, Corrected, or Inconclusive</li>
              <li>Assess if the care recommendation is appropriate</li>
              <li>Your reviews help improve the AI model for future predictions</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
            <h3 className="font-medium text-slate-900 dark:text-slate-50 mb-2">Verification Process</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Your account must be verified by an admin before you can review scans.
              This typically takes 1-2 business days after submitting your license information.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ensure your license number, specialty, and hospital affiliation are accurate.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-700">
            <h3 className="font-medium text-slate-900 dark:text-slate-50 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Contact our support team for technical issues or questions about the platform.
            </p>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">Review Responsibility</p>
              <p>
                Your clinical verdicts become part of patient records and are used to train and improve
                the AI model. Please ensure thorough and accurate assessments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}