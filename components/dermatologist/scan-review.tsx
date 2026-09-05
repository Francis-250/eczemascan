"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Shield, AlertTriangle, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitScanReview } from "@/lib/actions/review";
import { ScanCondition, ReviewVerdict, ScanStatus } from "@prisma/client";

const reviewSchema = z.object({
  verdict: z.enum(["CONFIRMED", "CORRECTED", "INCONCLUSIVE"]),
  correctedCondition: z.string().optional(),
  recommendationOk: z.boolean(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const conditionOptions: { value: ScanCondition; label: string }[] = [
  { value: "ECZEMA", label: "Eczema (Atopic Dermatitis)" },
  { value: "CONTACT_DERMATITIS", label: "Contact Dermatitis" },
  { value: "PSORIASIS", label: "Psoriasis" },
  { value: "FUNGAL_INFECTION", label: "Fungal Infection" },
  { value: "OTHER", label: "Other" },
];

const statusConfig: Record<ScanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
  REVIEWED: { label: "Reviewed", variant: "success" },
  FLAGGED: { label: "Flagged", variant: "destructive" },
};

const conditionLabels: Record<ScanCondition, string> = {
  ECZEMA: "Eczema (Atopic Dermatitis)",
  CONTACT_DERMATITIS: "Contact Dermatitis",
  PSORIASIS: "Psoriasis",
  FUNGAL_INFECTION: "Fungal Infection",
  OTHER: "Other",
};

interface ScanReviewPageProps {
  scan: {
    id: string;
    imageUrl: string;
    aiCondition: ScanCondition;
    aiConfidenceScore: number;
    aiExplanation: string;
    status: ScanStatus;
    createdAt: Date;
    recommendation?: {
      condition: ScanCondition;
      careAdvice: string;
      disclaimer: string;
    } | null;
    patient: { name: string; patientProfile: { dateOfBirth: Date | null; sex: string | null; allergyHistory: boolean; familyHistory: boolean; location: string | null } | null };
  };
}

export default function ScanReviewPage({ scan }: ScanReviewPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      verdict: "CONFIRMED" as const,
      correctedCondition: undefined,
      recommendationOk: true,
    },
  });

  const verdict = watch("verdict");
  const showCorrectedCondition = verdict === "CORRECTED";

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("scanId", scan.id);
    formData.append("verdict", data.verdict);
    formData.append("recommendationOk", String(data.recommendationOk));
    if (data.correctedCondition) {
      formData.append("correctedCondition", data.correctedCondition);
    }

    try {
      const result = await submitScanReview(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/doctor/scans");
        router.refresh();
      }
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const age = scan.patient.patientProfile?.dateOfBirth
    ? Math.floor((Date.now() - new Date(scan.patient.patientProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : "Unknown";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/doctor/scans" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Queue
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lesion Image</CardTitle>
              <Badge variant={statusConfig[scan.status].variant}>
                {statusConfig[scan.status].label}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <img
                src={scan.imageUrl}
                alt={`Scan ${scan.id}`}
                className="w-full aspect-[4/3] object-cover"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Shield className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Provisional AI Prediction</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Review the AI analysis below and provide your clinical verdict.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">AI Predicted Condition</label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">
                    {conditionLabels[scan.aiCondition]}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">Confidence Score</label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">
                    {Math.round(scan.aiConfidenceScore * 100)}%
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">AI Clinical Explanation</label>
                <p className="mt-2 p-4 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {scan.aiExplanation}
                </p>
              </div>
            </CardContent>
          </Card>

          {scan.recommendation && (
            <Card>
              <CardHeader>
                <CardTitle>Care Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-green-700 dark:text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">Non-Diagnostic Disclaimer</p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {scan.recommendation.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">Condition-Specific Care Advice</label>
                  <p className="mt-2 p-4 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {scan.recommendation.careAdvice}
                  </p>
                </div>

                <div className="border-t border-slate-200 dark:border-neutral-700 pt-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("recommendationOk")}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      Recommendation is appropriate for this case
                    </span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Patient Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Name</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{scan.patient.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Age</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{age}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Sex</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{scan.patient.patientProfile?.sex || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Location</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{scan.patient.patientProfile?.location || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Allergy History</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {scan.patient.patientProfile?.allergyHistory ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Family History</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {scan.patient.patientProfile?.familyHistory ? "Yes" : "No"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Clinical Verdict *</Label>
                  <RadioGroup onValueChange={(v) => setValue("verdict", v as ReviewVerdict)} defaultValue={watch("verdict")}>
                    <div className="space-y-2">
                      {([
                        { value: "CONFIRMED", label: "Confirmed", desc: "AI prediction is correct" },
                        { value: "CORRECTED", label: "Corrected", desc: "AI prediction is incorrect" },
                        { value: "INCONCLUSIVE", label: "Inconclusive", desc: "Cannot determine from image" },
                      ] as const).map((item) => (
                        <label
                          key={item.value}
                          className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                        >
                          <RadioGroupItem value={item.value} className="mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-50">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  {errors.verdict && (
                    <p className="mt-1 text-sm text-red-600">{errors.verdict.message}</p>
                  )}
                </div>

                {showCorrectedCondition && (
                  <div>
                    <Label htmlFor="correctedCondition">Corrected Condition *</Label>
                    <Select onValueChange={(v) => setValue("correctedCondition", v)} defaultValue={watch("correctedCondition")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select corrected condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.correctedCondition && (
                      <p className="mt-1 text-sm text-red-600">{errors.correctedCondition.message}</p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                  <Link href="/doctor/scans">
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium mb-1">Clinical Responsibility</p>
                  <p>
                    Your review verdict becomes part of the patient's medical record and is used to improve
                    the AI model. Please ensure your assessment is thorough and accurate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}