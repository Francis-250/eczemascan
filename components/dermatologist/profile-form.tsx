"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateDermatologistProfile } from "@/lib/actions/profile";

const profileSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  specialty: z.string().optional(),
  hospitalAffiliation: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface DermatologistProfileFormProps {
  initialProfile?: {
    licenseNumber: string;
    specialty: string | null;
    hospitalAffiliation: string | null;
    yearsOfExperience: number | null;
    bio: string | null;
    verificationStatus: string;
  } | null;
}

export default function DermatologistProfileForm({ initialProfile }: DermatologistProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      licenseNumber: initialProfile?.licenseNumber || "",
      specialty: initialProfile?.specialty || "",
      hospitalAffiliation: initialProfile?.hospitalAffiliation || "",
      yearsOfExperience: initialProfile?.yearsOfExperience?.toString() || "",
      bio: initialProfile?.bio || "",
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
      const result = await updateDermatologistProfile(formData);
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dermatologist Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your professional information and verification status.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>Profile updated successfully</span>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Verification Status</CardTitle>
          <Badge
            variant={
              initialProfile?.verificationStatus === "APPROVED" ? "success"
              : initialProfile?.verificationStatus === "PENDING" ? "warning"
              : "destructive"
            }
          >
            {initialProfile?.verificationStatus === "APPROVED" && <Shield className="h-3.5 w-3.5 mr-1.5" />}
            {initialProfile?.verificationStatus}
          </Badge>
        </CardHeader>
        <CardContent>
          {initialProfile?.verificationStatus === "PENDING" && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-300">
                Your account is pending admin verification. You cannot review scans until approved.
                Ensure your license information is complete and accurate.
              </p>
            </div>
          )}
          {initialProfile?.verificationStatus === "APPROVED" && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <p className="text-green-800 dark:text-green-300">
                Your account is verified. You can now review scans in the queue.
              </p>
            </div>
          )}
          {initialProfile?.verificationStatus === "REJECTED" && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300">
                Your verification was rejected. Please contact support for more information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>License Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                placeholder="Enter your medical license number"
                {...register("licenseNumber")}
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                placeholder="e.g., Dermatology, Pediatric Dermatology, Dermatopathology"
                {...register("specialty")}
              />
            </div>

            <div>
              <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
              <Input
                id="hospitalAffiliation"
                placeholder="e.g., General Hospital, University Medical Center"
                {...register("hospitalAffiliation")}
              />
            </div>

            <div>
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 10"
                {...register("yearsOfExperience")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                placeholder="Describe your background, areas of expertise, and clinical interests..."
                rows={5}
                {...register("bio")}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                This information helps patients and administrators understand your background.
              </p>
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
              <p className="font-medium mb-1">License verification required</p>
              <p>
                Your license number must be valid and verifiable. Admin approval is required before
                you can access the review queue. Ensure all information is accurate and up to date.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}