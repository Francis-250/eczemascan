"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updatePatientProfile } from "@/lib/actions/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  dateOfBirth: z.string().optional(),
  sex: z.string().optional(),
  skinType: z.string().optional(),
  allergyHistory: z.boolean(),
  familyHistory: z.boolean(),
  location: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const SKIN_TYPES = [
  "Type I - Very fair, always burns, never tans",
  "Type II - Fair, usually burns, tans minimally",
  "Type III - Medium, sometimes burns, tans gradually",
  "Type IV - Olive, rarely burns, tans well",
  "Type V - Brown, very rarely burns, tans very well",
  "Type VI - Dark brown/black, never burns, tans very well",
];

const SEX_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];

interface PatientProfileFormProps {
  initialProfile?: {
    dateOfBirth: Date | null;
    sex: string | null;
    skinType: string | null;
    allergyHistory: boolean;
    familyHistory: boolean;
    location: string | null;
  } | null;
}

export default function PatientProfileForm({ initialProfile }: PatientProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dateOfBirth: initialProfile?.dateOfBirth ? initialProfile.dateOfBirth.toISOString().split("T")[0] : "",
      sex: initialProfile?.sex || "",
      skinType: initialProfile?.skinType || "",
      allergyHistory: initialProfile?.allergyHistory ?? false,
      familyHistory: initialProfile?.familyHistory ?? false,
      location: initialProfile?.location || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    try {
      const result = await updatePatientProfile(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch {
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Patient Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update your profile information to help improve AI analysis accuracy.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>Profile updated successfully</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...register("dateOfBirth")}
              />
            </div>

            <div>
              <Label htmlFor="sex">Sex</Label>
              <Select onValueChange={(v) => setValue("sex", v)} defaultValue={watch("sex")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skinType">Fitzpatrick Skin Type</Label>
              <Select onValueChange={(v) => setValue("skinType", v)} defaultValue={watch("skinType")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skin type" />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                This helps assess skin cancer risk and treatment response.
              </p>
            </div>

            <div>
              <Label htmlFor="location">Location (City, Country)</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                {...register("location")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-slate-900 dark:text-slate-50">Allergy History</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Personal history of allergies, asthma, or hay fever
                </p>
              </div>
              <input
                type="checkbox"
                {...register("allergyHistory")}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-slate-900 dark:text-slate-50">Family History of Eczema</label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Close relatives with atopic dermatitis
                </p>
              </div>
              <input
                type="checkbox"
                {...register("familyHistory")}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Badge variant="warning" className="flex-shrink-0 mt-0.5">
              Important
            </Badge>
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">Profile data is used for AI analysis context</p>
              <p>
                Your profile information (age, sex, allergy history, family history) is shared with the AI
                model to provide more accurate condition predictions. This data is not used for any other purpose.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}