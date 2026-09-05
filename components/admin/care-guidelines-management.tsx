"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Edit, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { upsertCareGuideline } from "@/lib/actions/admin";
import { ScanCondition } from "@prisma/client";

const guidelineSchema = z.object({
  condition: z.enum(["ECZEMA", "CONTACT_DERMATITIS", "PSORIASIS", "FUNGAL_INFECTION", "OTHER"]),
  title: z.string().min(1, "Title is required"),
  advice: z.string().min(10, "Advice must be at least 10 characters"),
});

type GuidelineFormData = z.infer<typeof guidelineSchema>;

const CONDITIONS: { value: ScanCondition; label: string }[] = [
  { value: "ECZEMA", label: "Eczema (Atopic Dermatitis)" },
  { value: "CONTACT_DERMATITIS", label: "Contact Dermatitis" },
  { value: "PSORIASIS", label: "Psoriasis" },
  { value: "FUNGAL_INFECTION", label: "Fungal Infection" },
  { value: "OTHER", label: "Other" },
];

interface CareGuidelinesManagementProps {
  guidelines: {
    id: string;
    condition: ScanCondition;
    title: string;
    advice: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export default function CareGuidelinesManagement({ guidelines }: CareGuidelinesManagementProps) {
  const router = useRouter();
  const [editingGuideline, setEditingGuideline] = useState<typeof guidelines[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GuidelineFormData>({
    resolver: zodResolver(guidelineSchema),
    defaultValues: {
      condition: "ECZEMA",
      title: "",
      advice: "",
    },
  });

  const openCreateDialog = () => {
    reset({
      condition: "ECZEMA",
      title: "",
      advice: "",
    });
    setEditingGuideline(null);
  };

  const openEditDialog = (guideline: typeof guidelines[0]) => {
    reset({
      condition: guideline.condition,
      title: guideline.title,
      advice: guideline.advice,
    });
    setEditingGuideline(guideline);
  };

  const onSubmit = async (data: GuidelineFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("condition", data.condition);
    formData.append("title", data.title);
    formData.append("advice", data.advice);
    if (editingGuideline) {
      formData.append("id", editingGuideline.id);
    }

    try {
      const result = await upsertCareGuideline(formData);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch {
      alert("Failed to save guideline");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Care Guidelines</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage condition-specific care advice for AI recommendations.
          </p>
        </div>
        <Dialog open={!!editingGuideline || false} onOpenChange={(open) => !open && setEditingGuideline(null)}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Guideline
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingGuideline ? "Edit Guideline" : "Create Guideline"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select onValueChange={(v) => setValue("condition", v as ScanCondition)} defaultValue={watch("condition")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>}
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="e.g., Eczema Care Guidelines" {...register("title")} />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="advice">Care Advice *</Label>
                <Textarea id="advice" placeholder="Detailed care advice for this condition..." rows={6} {...register("advice")} />
                {errors.advice && <p className="mt-1 text-sm text-red-600">{errors.advice.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setEditingGuideline(null); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingGuideline ? "Update" : "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {guidelines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">No Care Guidelines</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create care guidelines for each condition to provide patients with specific advice.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Guideline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guidelines.map((guideline) => (
            <Card key={guideline.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{guideline.title}</CardTitle>
                  <Badge variant="info">{guideline.condition}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300 line-clamp-4">{guideline.advice}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-neutral-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Updated {new Date(guideline.updatedAt).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(guideline)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit guideline</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">Guidelines are used in AI recommendations</p>
              <p>
                The care advice you define here is automatically attached to AI-generated recommendations
                for the corresponding condition. Ensure advice is evidence-based and includes the standard
                disclaimer that this is not a medical diagnosis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}