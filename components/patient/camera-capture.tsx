"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function CameraCapture({ onCapture, onClose }: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | undefined;
    active.current = true;
    async function openCamera() {
      try {
        if (!window.isSecureContext) throw new Error("Open this site over HTTPS or localhost to access the camera. You can also upload a photo.");
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser cannot access a camera. Please upload a photo instead.");
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        if (cancelled) { stream.getTracks().forEach(track => track.stop()); return; }
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play();
        }
      } catch (cause) {
        stream?.getTracks().forEach(track => track.stop());
        if (cancelled) return;
        const name = cause instanceof Error ? cause.name : "";
        setError(name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access in your browser's site settings, then close and reopen the camera."
          : name === "NotFoundError"
            ? "No camera was found. Connect a camera or upload a photo."
            : name === "NotReadableError"
              ? "The camera is busy. Close other apps using it and try again."
              : cause instanceof Error ? cause.message : "Could not open the camera. Please upload a photo.");
      }
    }
    void openCamera();
    return () => {
      cancelled = true;
      active.current = false;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  function capture() {
    const source = video.current;
    if (!source || !source.videoWidth || !source.videoHeight || capturing) return;
    setCapturing(true);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1920 / Math.max(source.videoWidth, source.videoHeight));
    canvas.width = Math.round(source.videoWidth * scale);
    canvas.height = Math.round(source.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) { setCapturing(false); setError("Could not capture the photo. Please try uploading one."); return; }
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!active.current) return;
      setCapturing(false);
      if (!blob) { setError("Could not capture the photo. Please try again."); return; }
      onCapture(new File([blob], `skin-photo-${Date.now()}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  }

  return (
    <section aria-label="Camera" className="space-y-3">
      <video ref={video} autoPlay muted playsInline onCanPlay={() => setReady(true)} className="w-full max-h-96 rounded-lg bg-black" aria-label="Live camera preview" />
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : !ready && <p role="status" className="text-sm text-slate-500">Waiting for camera access. Allow access when your browser asks.</p>}
      <div className="flex justify-center gap-3">
        <Button type="button" disabled={!ready || capturing || !!error} onClick={capture}>{capturing ? "Capturing..." : "Capture Photo"}</Button>
        <Button type="button" variant="outline" onClick={onClose}>Close Camera</Button>
      </div>
    </section>
  );
}
