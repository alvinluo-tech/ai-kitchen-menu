"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type FieldAssistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: "description" | "story" | "tags";
  currentValue?: string;
  dishContext?: {
    name?: string;
    cuisine?: string;
    ingredients?: string[];
  };
  onApply: (value: string | string[]) => void;
};

const fieldLabels = {
  description: "描述",
  story: "朋友的一句话",
  tags: "风味标签",
};

const actionOptions = [
  { value: "rewrite", label: "改写得更自然" },
  { value: "expand", label: "扩写成完整内容" },
  { value: "shorten", label: "精简保留核心" },
];

const toneOptions = [
  { value: "warm", label: "温暖" },
  { value: "simple", label: "简洁" },
  { value: "friendly", label: "朋友感" },
  { value: "menu", label: "菜单风" },
] as const;

function getActionLabel(value: string) {
  return actionOptions.find((item) => item.value === value)?.label ?? "选择操作";
}

function getToneLabel(value: string) {
  return toneOptions.find((item) => item.value === value)?.label ?? "选择风格";
}

export function FieldAssistDialog({
  open,
  onOpenChange,
  field,
  currentValue,
  dishContext,
  onApply,
}: FieldAssistDialogProps) {
  const [keywords, setKeywords] = useState("");
  const [action, setAction] = useState("rewrite");
  const [tone, setTone] = useState("friendly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/field-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue,
          keywords: keywords || undefined,
          dishContext,
          action,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "生成失败");
        return;
      }

      setResult(data.result);
    } catch {
      setError("生成失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      onOpenChange(false);
      setResult(null);
      setKeywords("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-orange-500" />
            AI 帮你写{fieldLabels[field]}
          </DialogTitle>
          <DialogDescription>
            {currentValue ? "输入关键词，AI 会帮你改写内容" : "输入关键词，AI 会帮你生成内容"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentValue && (
            <div className="space-y-2">
              <Label>操作方式</Label>
              <Select value={action} onValueChange={(v) => v && setAction(v)}>
                <SelectTrigger>
                  <span>{getActionLabel(action)}</span>
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {field !== "tags" && (
            <div className="space-y-2">
              <Label>关键词</Label>
              <Textarea
                placeholder={
                  field === "description"
                    ? "例如：酸甜、快手、家常、适合配米饭"
                    : "例如：小时候妈妈常做、很温暖、下饭"
                }
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {field === "tags" && dishContext?.name && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>将根据菜名「{dishContext.name}」
                {dishContext.cuisine && `、菜系「${dishContext.cuisine}」`}
                {dishContext.ingredients?.length && `、食材「${dishContext.ingredients.slice(0, 5).join("、")}」`}
                自动生成标签
              </p>
            </div>
          )}

          {field !== "tags" && (
            <div className="space-y-2">
              <Label>语气风格</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                <SelectTrigger>
                  <span>{getToneLabel(tone)}</span>
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {result && (
            <div className="space-y-2">
              <Label>生成结果</Label>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                {Array.isArray(result) ? (
                  <div className="flex flex-wrap gap-2">
                    {result.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-white rounded-md text-sm border">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{result}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {result ? "重新生成" : "生成"}
                </>
              )}
            </Button>

            {result && (
              <Button onClick={handleApply} variant="default">
                使用此内容
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
