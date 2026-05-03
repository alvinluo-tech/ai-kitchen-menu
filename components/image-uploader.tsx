"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageUploaderProps = {
  onUpload: (url: string) => void;
  disabled?: boolean;
};

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.8,
  fileType: "image/webp" as const,
};

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB");
      return;
    }

    setError(null);

    try {
      setCompressing(true);
      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      setCompressing(false);

      setUploading(true);
      const formData = new FormData();
      formData.append("file", compressedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "上传失败");
      }

      onUpload(data.url);

      // 重置 input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading || compressing}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-24 border-dashed"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading || compressing}
      >
        {compressing || uploading ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <Upload className="h-5 w-5 mr-2" />
        )}
        {compressing
          ? "压缩中..."
          : uploading
          ? "上传中..."
          : "点击上传图片"}
      </Button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
