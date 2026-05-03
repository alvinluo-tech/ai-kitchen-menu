"use client";

import { useState, useEffect } from "react";
import { ChefHat, CookingPot, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DishCardSkeleton } from "@/components/dish-card-skeleton";

type AiLoadingMode = "recommend" | "field" | "image";

type AiLoadingStateProps = {
  mode: AiLoadingMode;
};

const rotatingTexts: Record<AiLoadingMode, string[]> = {
  recommend: [
    "正在翻看朋友的拿手菜单...",
    "正在匹配你手头的食材...",
    "正在筛掉不适合的选择...",
    "正在比较口味、时间和辣度...",
    "正在挑出今天最合适的几道...",
  ],
  field: [
    "正在整理成更自然的表达...",
    "正在写得更像朋友的介绍...",
    "正在让这段话更适合菜单展示...",
  ],
  image: [
    "正在构思菜品画面...",
    "正在准备摆盘...",
    "正在调整自然光线...",
    "正在生成一张参考图...",
  ],
};

function FloatingIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-block ${className}`} style={{ animation: "ai-float 2s ease-in-out infinite" }}>
      {children}
    </span>
  );
}

function TwinkleIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-block ${className}`} style={{ animation: "ai-twinkle 1.5s ease-in-out infinite" }}>
      {children}
    </span>
  );
}

function ShakeIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-block ${className}`} style={{ animation: "ai-shake 2s ease-in-out infinite" }}>
      {children}
    </span>
  );
}

function RecommendLoading() {
  const texts = rotatingTexts.recommend;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [texts.length]);

  return (
    <div className="space-y-4">
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <FloatingIcon>
              <ChefHat className="h-6 w-6 text-orange-500" />
            </FloatingIcon>
            <h3 className="text-lg font-semibold text-gray-800">正在帮你挑菜</h3>
            <TwinkleIcon>
              <Sparkles className="h-5 w-5 text-amber-400" />
            </TwinkleIcon>
          </div>
          <p className="text-sm text-gray-600 min-h-[1.25rem] transition-opacity duration-300">
            {texts[index]}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <DishCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function FieldLoading() {
  const texts = rotatingTexts.field;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [texts.length]);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <FloatingIcon>
        <Wand2 className="h-6 w-6 text-orange-400" />
      </FloatingIcon>
      <p className="text-sm text-gray-500 text-center min-h-[1.25rem]">
        {texts[index]}
      </p>
    </div>
  );
}

function ImageLoading() {
  const texts = rotatingTexts.image;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [texts.length]);

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <ShakeIcon>
            <CookingPot className="h-16 w-16 text-orange-200" />
          </ShakeIcon>
        </div>
        <div className="absolute top-3 right-3">
          <TwinkleIcon>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </TwinkleIcon>
        </div>
        <div className="absolute top-3 left-3">
          <TwinkleIcon className="[animation-delay:0.5s]">
            <Sparkles className="h-4 w-4 text-amber-200" />
          </TwinkleIcon>
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center min-h-[1.25rem]">
        {texts[index]}
      </p>
      <p className="text-xs text-gray-400 text-center">
        生成图片可能需要 10–30 秒，请不要关闭页面。
      </p>
    </div>
  );
}

export function AiLoadingState({ mode }: AiLoadingStateProps) {
  return (
    <>
      <style>{`
        @keyframes ai-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ai-twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes ai-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>
      {mode === "recommend" && <RecommendLoading />}
      {mode === "field" && <FieldLoading />}
      {mode === "image" && <ImageLoading />}
    </>
  );
}
