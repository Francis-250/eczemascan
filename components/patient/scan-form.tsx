"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "@/components/patient/camera-capture";
import { createScan } from "@/lib/actions/scan";

export default function ScanForm() {
  const router = useRouter();
  const uploadInput = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectImage(file?: File) {
    if (!file) return;
    setError(null);
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setImage(null);
      setPreview(null);
      setError("Please select a JPG, PNG, or WebP image up to 10MB.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image || isSubmitting || cameraOpen) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("image", image);
      const result = await createScan(data);
      if (result.error) setError(result.error);
      else if (result.scan) router.push(`/patient/scans/${result.scan.id}`);
    } catch {
      setError("Could not analyze the image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={analyze} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          New Skin Scan
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload a clear photo of your skin to analyze it.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {cameraOpen && (
            <CameraCapture
              onCapture={(file) => {
                selectImage(file);
                setCameraOpen(false);
              }}
              onClose={() => setCameraOpen(false)}
            />
          )}
          {preview && !cameraOpen && (
            // A local browser preview cannot use the server image optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Selected skin photograph"
              className="max-h-80 rounded-lg mx-auto"
            />
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || cameraOpen}
              onClick={() => uploadInput.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {image ? "Change Image" : "Upload Image"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || cameraOpen}
              onClick={() => {
                setError(null);
                setCameraOpen(true);
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
          <input
            ref={uploadInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload skin photograph"
            className="hidden"
            disabled={isSubmitting}
            onChange={(e) => {
              selectImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p className="text-center text-sm text-slate-500">
            JPG, PNG, or WebP. Maximum 10MB.
          </p>
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
      <Button
        type="submit"
        className="w-full"
        disabled={!image || isSubmitting || cameraOpen}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Analyzing Image...
          </>
        ) : (
          "Analyze Image"
        )}
      </Button>
      <p className="text-sm text-slate-500">
        Results are provisional and require dermatologist review. This is not a
        medical diagnosis.
      </p>
    </form>
  );
}
