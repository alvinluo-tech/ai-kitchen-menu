"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { DishDraft } from "@/lib/ai/dish-draft-schema";

type AiAssistFormProps = {
  onDraftGenerated: (draft: DishDraft) => void;
};

export function AiAssistForm({ onDraftGenerated }: AiAssistFormProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (description.trim().length < 5) {
      setError("请至少输入 5 个字的描述");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dishes/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "生成失败");
        return;
      }

      onDraftGenerated(data.draft);
      setDescription("");
    } catch {
      setError("生成失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-orange-500" />
          AI 助写
        </CardTitle>
        <CardDescription className="text-xs">
          简单说说这道菜，AI 会帮你生成简介、标签和食材草稿
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="例如：番茄牛腩，酸甜浓郁，适合冬天吃，汤汁拌饭很好吃，主要食材有牛腩、番茄、洋葱、姜蒜"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={loading}
          className="text-sm resize-none bg-white"
        />

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || description.trim().length < 5}
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              生成草稿
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
