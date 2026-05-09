"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DishCard } from "@/components/dish-card";
import { EmptyState } from "@/components/empty-state";
import { AiLoadingState } from "@/components/ai-loading-state";
import { getDishImageUrl } from "@/lib/dishes/types";

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
    order_count?: number;
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

type CacheEntry = {
  message: string;
  summary: string;
  recommendations: Recommendation[];
  createdAt: number;
};

const CACHE_KEY = "ai-kitchen-menu:recommendation:last";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function readCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.createdAt > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

function clearCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}

export function AiRecommendForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setMessage(cached.message);
      setResult({ summary: cached.summary, recommendations: cached.recommendations });
    }
  }, []);

  const handleClear = useCallback(() => {
    setMessage("");
    setResult(null);
    setError(null);
    clearCache();
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "AI 推荐暂时失败，请稍后再试。");
        return;
      }

      setResult(data);
      writeCache({
        message: message.trim(),
        summary: data.summary,
        recommendations: data.recommendations,
        createdAt: Date.now(),
      });
    } catch {
      setError("AI 推荐暂时失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <Textarea
              placeholder="例如：我想吃一点辣的、下饭的，家里有土豆、鸡蛋和牛肉，不想吃太油，最好 40 分钟以内。"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none text-sm md:text-base"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 gap-2">
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
              {result && !loading && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  重新推荐
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 md:p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && <AiLoadingState mode="recommend" />}

      {result && !loading && (
        <div className="space-y-4 md:space-y-6">
          {result.summary && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-3 md:p-4">
                <p className="text-sm md:text-base text-gray-700">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          {result.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {result.recommendations.map((rec, index) => (
                <DishCard
                  key={rec.dish.id}
                  dishId={rec.dish.id}
                  name={rec.dish.name}
                  slug={rec.dish.slug}
                  imageUrl={getDishImageUrl(rec.dish.image_url)}
                  description={rec.dish.description}
                  tags={rec.dish.dish_tags?.map((tag) => tag.tag) ?? []}
                  cookingTimeMinutes={rec.dish.cooking_time_minutes}
                  spiceLevel={rec.dish.spice_level}
                  orderCount={rec.dish.order_count}
                  score={rec.score}
                  reason={rec.reason}
                  matchedIngredients={rec.matchedIngredients}
                  missingIngredients={rec.missingIngredients}
                  rank={index + 1}
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
