"use client";

import { useState, useRef, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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

type FileTask = {
  id: string;
  name: string;
  status: "compressing" | "uploading" | "done" | "error";
  progress: number; // 0-100 for compression
  error?: string;
};

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [tasks, setTasks] = useState<FileTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const compressFile = useCallback(
    async (file: File, task: FileTask): Promise<File> => {
      return imageCompression(file, {
        ...COMPRESSION_OPTIONS,
        onProgress: (pct: number) => {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, progress: Math.round(pct) } : t
            )
          );
        },
      });
    },
    []
  );

  const uploadFile = useCallback(
    async (file: File, task: FileTask): Promise<string> => {
      const supabase = createClient();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const filePath = `dishes/${timestamp}-${random}.webp`;

      const { error: uploadError } = await supabase.storage
        .from("dish-images")
        .upload(filePath, file, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "上传失败");
      }

      const { data: urlData } = supabase.storage
        .from("dish-images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    },
    []
  );

  const processFile = useCallback(
    async (file: File, task: FileTask) => {
      try {
        // Compress
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "compressing" as const } : t
          )
        );
        const compressed = await compressFile(file, task);

        // Upload
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "uploading" as const } : t
          )
        );
        const url = await uploadFile(compressed, task);

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "done" as const, progress: 100 } : t
          )
        );
        onUpload(url);
      } catch (err) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "失败",
                }
              : t
          )
        );
      }
    },
    [compressFile, uploadFile, onUpload]
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );

      if (fileArray.length === 0) {
        setError("未选择有效的图片文件");
        return;
      }

      if (files.length !== fileArray.length) {
        setError("已跳过非图片文件");
      }

      setError(null);

      const newTasks: FileTask[] = fileArray.map((f, i) => ({
        id: `${Date.now()}-${i}`,
        name: f.name,
        status: "compressing" as const,
        progress: 0,
      }));

      setTasks((prev) => [...prev, ...newTasks]);

      // Process all files in parallel
      fileArray.forEach((file, i) => {
        processFile(file, newTasks[i]);
      });

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const activeTasks = tasks.filter((t) => t.status === "compressing" || t.status === "uploading");
  const errorTasks = tasks.filter((t) => t.status === "error");
  const isBusy = activeTasks.length > 0 || disabled;

  const overallProgress =
    tasks.length > 0
      ? Math.round(
          tasks.reduce((sum, t) => sum + (t.status === "done" ? 100 : t.progress), 0) /
            tasks.length
        )
      : 0;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={isBusy}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-24 border-dashed flex-col gap-1"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">
              {tasks.some((t) => t.status === "compressing")
                ? `压缩中 ${overallProgress}%`
                : `上传中 (${tasks.filter((t) => t.status === "done").length}/${tasks.length})`}
            </span>
            {/* Progress bar */}
            <div className="w-3/4 h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span className="text-xs text-gray-500">点击上传（支持多选）</span>
          </>
        )}
      </Button>

      {/* Task list */}
      {tasks.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-gray-50"
            >
              {task.status === "compressing" && (
                <Loader2 className="h-3 w-3 animate-spin text-orange-400 flex-shrink-0" />
              )}
              {task.status === "uploading" && (
                <Loader2 className="h-3 w-3 animate-spin text-blue-400 flex-shrink-0" />
              )}
              {task.status === "done" && (
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
              )}
              {task.status === "error" && (
                <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
              )}
              <span className="truncate flex-1">{task.name}</span>
              <span className="text-gray-400 flex-shrink-0">
                {task.status === "compressing" && `${task.progress}%`}
                {task.status === "uploading" && "上传中"}
                {task.status === "done" && "✓"}
                {task.status === "error" && task.error}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && !isBusy && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
