"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DishCard } from "@/components/dish-card";
import { EmptyState } from "@/components/empty-state";

type Recommendation = {
  dish: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url?: string | null;
    cuisine?: string | null;
    spice_level: number;
    cooking_time_minutes?: number | null;
    dish_tags?: { id: string; tag: string }[];
    dish_ingredients?: {
      id: string;
      amount?: string | null;
      is_required: boolean;
      ingredients: { id: string; name: string };
    }[];
  };
  score: number;
  reason: string;
  matchedIngredients: string[];
  missingIngredients: string[];
};

type ApiResponse = {
  summary: string;
  recommendations: Recommendation[];
  error?: string;
};

export function AiRecommendForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim().length < 2) {
      setError("可以再具体一点，比如你想吃的口味、已有食材或忌口。");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "AI 推荐暂时失败，请稍后再试。");
        return;
      }

      setResult(data);
    } catch {
      setError("AI 推荐暂时失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="例如：我想吃一点辣的、下饭的，家里有土豆、鸡蛋和牛肉，不想吃太油，最好 40 分钟以内。"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在推荐...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  帮我推荐
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {result.summary && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <p className="text-gray-700">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          {result.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.recommendations.map((rec) => (
                <DishCard
                  key={rec.dish.id}
                  name={rec.dish.name}
                  slug={rec.dish.slug}
                  imageUrl={rec.dish.image_url}
                  description={rec.dish.description}
                  tags={rec.dish.dish_tags?.map((tag) => tag.tag) ?? []}
                  cookingTimeMinutes={rec.dish.cooking_time_minutes}
                  spiceLevel={rec.dish.spice_level}
                  score={rec.score}
                  reason={rec.reason}
                  matchedIngredients={rec.matchedIngredients}
                  missingIngredients={rec.missingIngredients}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="暂时没有特别匹配的菜"
              description="你可以换一种描述，或者让朋友再上传几道菜。"
            />
          )}
        </div>
      )}
    </div>
  );
}
