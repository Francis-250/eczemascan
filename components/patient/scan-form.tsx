"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createScan } from "@/lib/actions/scan";

const scanSchema = z.object({
  lesionLocation: z.string().min(1, "Lesion location is required"),
  duration: z.string().min(1, "Duration is required"),
  itchingSeverity: z.string().min(1, "Itching severity is required"),
  skinAppearance: z.string().min(1, "Skin appearance is required"),
  rednessLevel: z.string().min(1, "Redness level is required"),
  drynessScaling: z.string().min(1, "Dryness/scaling is required"),
  triggerExposure: z.string().optional(),
  description: z.string().optional(),
});

type ScanFormData = z.infer<typeof scanSchema>;

const LOCATIONS = [
  "Face", "Neck", "Scalp", "Ears", "Hands", "Arms", "Legs", "Feet",
  "Torso (front)", "Torso (back)", "Groin", "Other"
];

const DURATIONS = [
  "Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3-6 months", "More than 6 months"
];

const SEVERITIES = [
  "None", "Mild", "Moderate", "Severy", "Very Severe"
];

const APPEARANCES = [
  "Red patches", "Dry/scaly", "Bumpy/raised", "Blistering", "Oozing/crusting", "Thickened", "Lichenified"
];

const REDNESS = ["None", "Mild", "Moderate", "Severe"];
const DRYNESS = ["None", "Mild", "Moderate", "Severe"];

interface ScanFormProps {
  initialProfile?: {
    dateOfBirth: Date | null;
    sex: string | null;
    allergyHistory: boolean;
    familyHistory: boolean;
  } | null;
}

export default function ScanForm({ initialProfile }: ScanFormProps) {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ScanFormData>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      lesionLocation: "",
      duration: "",
      itchingSeverity: "",
      skinAppearance: "",
      rednessLevel: "",
      drynessScaling: "",
      triggerExposure: "",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => handleImageChange(e as any);
    input.click();
  };

  const onSubmit = async (data: ScanFormData) => {
    if (!image) {
      setError("Please upload or capture an image");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const result = await createScan(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/patient/scans"), 1500);
      }
    } catch {
      setError("Failed to submit scan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Scan Submitted Successfully
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your scan has been submitted for AI analysis and dermatologist review.
              You will be notified once the review is complete.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">New Skin Scan</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload or capture a photo of your skin lesion and provide details for AI analysis.
        </p>
      </div>

      {initialProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Profile Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Age: </span>
                <span className="font-medium">
                  {initialProfile.dateOfBirth
                    ? Math.floor((Date.now() - new Date(initialProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : "Not set"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Sex: </span>
                <span className="font-medium">{initialProfile.sex || "Not set"}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Allergy History: </span>
                <Badge variant={initialProfile.allergyHistory ? "default" : "secondary"}>
                  {initialProfile.allergyHistory ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Family History: </span>
                <Badge variant={initialProfile.familyHistory ? "default" : "secondary"}>
                  {initialProfile.familyHistory ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              This information helps the AI provide a more accurate assessment.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lesion Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center dark:border-neutral-700">
            {preview ? (
              <div className="relative max-w-xs mx-auto">
                <img
                  src={preview}
                  alt="Lesion preview"
                  className="max-h-64 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <span className="sr-only">Remove image</span>
                  ×
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Supported formats: JPG, PNG, WebP. Max size: 10MB.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesion Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lesionLocation">Lesion Location *</Label>
              <Select onValueChange={(v) => setValue("lesionLocation", v)} defaultValue={watch("lesionLocation")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lesionLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.lesionLocation.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duration of Symptoms *</Label>
              <Select onValueChange={(v) => setValue("duration", v)} defaultValue={watch("duration")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itchingSeverity">Itching Severity *</Label>
                <Select onValueChange={(v) => setValue("itchingSeverity", v)} defaultValue={watch("itchingSeverity")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.itchingSeverity && (
                  <p className="mt-1 text-sm text-red-600">{errors.itchingSeverity.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="skinAppearance">Skin Appearance *</Label>
                <Select onValueChange={(v) => setValue("skinAppearance", v)} defaultValue={watch("skinAppearance")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appearance" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPEARANCES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.skinAppearance && (
                  <p className="mt-1 text-sm text-red-600">{errors.skinAppearance.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rednessLevel">Redness Level *</Label>
                <Select onValueChange={(v) => setValue("rednessLevel", v)} defaultValue={watch("rednessLevel")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {REDNESS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rednessLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.rednessLevel.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="drynessScaling">Dryness/Scaling *</Label>
                <Select onValueChange={(v) => setValue("drynessScaling", v)} defaultValue={watch("drynessScaling")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRYNESS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.drynessScaling && (
                  <p className="mt-1 text-sm text-red-600">{errors.drynessScaling.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="triggerExposure">Known Trigger Exposure</Label>
              <Input
                id="triggerExposure"
                placeholder="e.g., new detergent, nickel jewelry, poison ivy..."
                {...register("triggerExposure")}
              />
            </div>

            <div>
              <Label htmlFor="description">Additional Description</Label>
              <Textarea
                id="description"
                placeholder="Describe any other symptoms, changes over time, or relevant details..."
                rows={3}
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting || !image}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit for Analysis"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Disclaimer:</strong> This AI analysis is not a medical diagnosis. Results are provisional
          and must be reviewed by a licensed dermatologist. Please consult a healthcare professional
          for proper evaluation and treatment.
        </p>
      </div>
    </div>
  );
}