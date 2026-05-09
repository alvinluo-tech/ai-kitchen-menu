"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.85,
  fileType: "image/webp" as const,
};

type TaskStatus = "compressing" | "uploading" | "done" | "error";

type FileTask = {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  createdAt: number;
  error?: string;
};

function genId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

// Cleanup: remove done/error tasks older than this
const TASK_CLEANUP_MS = 30_000;
const MAX_VISIBLE_TASKS = 20;

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [tasks, setTasks] = useState<FileTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stable callback ref to avoid useCallback churn
  const onUploadRef = useRef(onUpload);
  onUploadRef.current = onUpload;

  // Purge old completed tasks periodically
  useEffect(() => {
    if (tasks.length === 0) return;
    const now = Date.now();
    const hasStale = tasks.some(
      (t) =>
        (t.status === "done" || t.status === "error") &&
        now - t.createdAt > TASK_CLEANUP_MS
    );
    if (!hasStale) return;

    const timer = setTimeout(() => {
      setTasks((prev) => {
        const cutoff = Date.now() - TASK_CLEANUP_MS;
        const kept = prev.filter(
          (t) =>
            (t.status !== "done" && t.status !== "error") ||
            t.createdAt > cutoff
        );
        return kept.slice(-MAX_VISIBLE_TASKS);
      });
    }, TASK_CLEANUP_MS);
    return () => clearTimeout(timer);
  }, [tasks]);

  const compressFile = useCallback(
    async (file: File, task: FileTask): Promise<File> => {
      let lastUpdate = 0;
      return imageCompression(file, {
        ...COMPRESSION_OPTIONS,
        onProgress: (pct: number) => {
          const now = Date.now();
          // Throttle to ~4 updates/sec to avoid excessive re-renders
          if (now - lastUpdate < 250) return;
          lastUpdate = now;
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
    async (file: File): Promise<string> => {
      const supabase = createClient();
      const filePath = `dishes/${genId()}.webp`;

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
        // Normalize: iOS Safari returns empty MIME for HEIC — create new File with proper type
        const normalizedFile =
          file.type || !file.name.includes(".")
            ? file
            : new File([file], file.name, {
                type: `image/${file.name.split(".").pop()?.toLowerCase()}`,
              });

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "compressing" as const } : t
          )
        );
        const compressed = await compressFile(normalizedFile, task);

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "uploading" as const } : t
          )
        );
        const url = await uploadFile(compressed);

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "done" as const, progress: 100 }
              : t
          )
        );
        onUploadRef.current(url);
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
    [compressFile, uploadFile]
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files).filter((f) => {
        if (f.type.startsWith("image/")) return true;
        // iOS Safari returns empty MIME for HEIC — fallback to extension
        const ext = f.name.split(".").pop()?.toLowerCase();
        return ext ? ["heic", "heif", "jpg", "jpeg", "png", "webp"].includes(ext) : false;
      });

      if (fileArray.length === 0) {
        setError("未选择有效的图片文件");
        return;
      }

      setError(null);

      const now = Date.now();
      const newTasks: FileTask[] = fileArray.map((f) => ({
        id: genId(),
        name: f.name,
        status: "compressing" as const,
        progress: 0,
        createdAt: now,
      }));

      setTasks((prev) => prev.concat(newTasks));

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

  const activeTasks = tasks.filter(
    (t) => t.status === "compressing" || t.status === "uploading"
  );
  const isBusy = activeTasks.length > 0 || disabled;

  // Overall progress for the progress bar
  const overallProgress =
    tasks.length > 0
      ? Math.round(
          tasks.reduce(
            (sum, t) => sum + (t.status === "done" ? 100 : t.progress),
            0
          ) / Math.min(tasks.length, MAX_VISIBLE_TASKS)
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
                : `上传中 (${tasks.filter((t) => t.status === "done").length}/${Math.min(tasks.length, MAX_VISIBLE_TASKS)})`}
            </span>
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
