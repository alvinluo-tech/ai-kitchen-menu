"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageUploaderProps = {
  onUpload: (url: string) => void;
  disabled?: boolean;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  initialQuality: 0.7,
  fileType: "image/webp" as const,
};

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }

    // No client-side size limit — compression will handle large files
    setError(null);

    try {
      setCompressing(true);
      setStatus("压缩中...");

      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

      setCompressing(false);
      setUploading(true);
      setStatus("上传中...");

      const formData = new FormData();
      formData.append("file", compressedFile, "image.webp");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "上传失败");
      }

      onUpload(data.url);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      setCompressing(false);
      setStatus("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const isBusy = disabled || uploading || compressing;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
        disabled={isBusy}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-24 border-dashed"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
      >
        {compressing || uploading ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <Upload className="h-5 w-5 mr-2" />
        )}
        {status || "点击上传图片"}
      </Button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
