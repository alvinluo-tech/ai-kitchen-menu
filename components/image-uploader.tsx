"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import imageCompression from "browser-image-compression";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export type ImageUploaderHandle = {
  reset: () => void;
};

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.8,
  fileType: "image/webp" as const,
};

export const ImageUploader = forwardRef<ImageUploaderHandle, ImageUploaderProps>(
  function ImageUploader({ value, onChange, disabled }, ref) {
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(value ?? null);
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setPreview(null);
        setOriginalSize(null);
        setCompressedSize(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
    }));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB");
      return;
    }

    setOriginalSize(file.size);
    setError(null);

    try {
      setCompressing(true);
      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      setCompressedSize(compressedFile.size);
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

      setPreview(data.url);
      onChange(data.url);
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

  const handleRemove = () => {
    setPreview(null);
    setOriginalSize(null);
    setCompressedSize(null);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
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

      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
          <img
            src={preview}
            alt="预览"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {compressedSize && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              WebP · {formatSize(compressedSize)}
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading || compressing}
        >
          {compressing || uploading ? (
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
          ) : (
            <Upload className="h-6 w-6 mr-2" />
          )}
          {compressing
            ? "压缩中..."
            : uploading
            ? "上传中..."
            : "点击上传图片"}
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        支持 JPG、PNG、WebP，最大 5MB，自动压缩为 WebP 格式
      </p>
    </div>
  );
});
