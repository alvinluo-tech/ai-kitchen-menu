"use client";

import { useState } from "react";
import { Loader2, Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SelectValue,
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

const actionLabels = {
  generate: "根据关键词生成",
  rewrite: "改写得更自然",
  expand: "扩写成完整内容",
  shorten: "精简保留核心",
};

export function FieldAssistDialog({
  open,
  onOpenChange,
  field,
  currentValue,
  dishContext,
  onApply,
}: FieldAssistDialogProps) {
  const [keywords, setKeywords] = useState("");
  const [action, setAction] = useState<"generate" | "rewrite" | "expand" | "shorten">(
    currentValue ? "rewrite" : "generate"
  );
  const [tone, setTone] = useState<"warm" | "simple" | "friendly" | "menu">("friendly");
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
            输入关键词或选择操作，AI 会帮你生成内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>操作方式</Label>
            <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generate">根据关键词生成</SelectItem>
                {currentValue && (
                  <>
                    <SelectItem value="rewrite">改写得更自然</SelectItem>
                    <SelectItem value="expand">扩写成完整内容</SelectItem>
                    <SelectItem value="shorten">精简保留核心</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {action === "generate" && (
            <div className="space-y-2">
              <Label>关键词</Label>
              <Textarea
                placeholder={
                  field === "description"
                    ? "例如：酸甜、快手、家常、适合配米饭"
                    : field === "story"
                    ? "例如：小时候妈妈常做、很温暖、下饭"
                    : "例如：下饭、家常、快手"
                }
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {field !== "tags" && (
            <div className="space-y-2">
              <Label>语气风格</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">温暖</SelectItem>
                  <SelectItem value="simple">简洁</SelectItem>
                  <SelectItem value="friendly">朋友感</SelectItem>
                  <SelectItem value="menu">菜单风</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {result && (
            <div className="space-y-2">
              <Label>AI 生成结果</Label>
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
              <Button onClick={handleApply} variant="default" className="gap-2">
                使用此内容
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
