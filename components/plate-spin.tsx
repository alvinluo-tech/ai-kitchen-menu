"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed, RotateCcw, ShoppingCart, ChefHat, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpinWheel } from "@/components/spin-wheel";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Dish } from "@/lib/dishes/types";

type CategorizedDishes = {
  meat: Dish[];
  vegetable: Dish[];
  soup: Dish[];
};

type SpinPhase =
  | "idle"
  | "spinning_meat"
  | "reveal_meat"
  | "spinning_vegetable"
  | "reveal_vegetable"
  | "spinning_soup"
  | "reveal_soup"
  | "done";

type ResultSlot = {
  category: "meat" | "vegetable" | "soup";
  label: string;
  icon: string;
  dish: Dish | null;
};

const CATEGORY_ORDER: { key: "meat" | "vegetable" | "soup"; label: string; icon: string }[] = [
  { key: "meat", label: "荤菜", icon: "🥩" },
  { key: "vegetable", label: "素菜", icon: "🥬" },
  { key: "soup", label: "汤品", icon: "🍲" },
];

const SPIN_STORAGE_KEY = "akm-spin-result";
const SPIN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type SpinSaved = { ids: string[]; ts: number };

function saveSpinResult(ids: string[]) {
  try {
    localStorage.setItem(SPIN_STORAGE_KEY, JSON.stringify({ ids, ts: Date.now() }));
  } catch {}
}

function loadSpinResult(): string[] | null {
  try {
    const raw = localStorage.getItem(SPIN_STORAGE_KEY);
    if (!raw) return null;
    const data: SpinSaved = JSON.parse(raw);
    if (Date.now() - data.ts > SPIN_TTL_MS) return null;
    return data.ids;
  } catch {
    return null;
  }
}

function clearSpinResult() {
  try {
    localStorage.removeItem(SPIN_STORAGE_KEY);
  } catch {}
}

function weightedRandomPick(pool: Dish[]): { index: number; dish: Dish } {
  // Weight by order_count + 1 to favor popular dishes
  const weights = pool.map((d) => (d.order_count ?? 0) + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return { index: i, dish: pool[i] };
  }
  return { index: pool.length - 1, dish: pool[pool.length - 1] };
}

export function PlateSpin({ categorizedDishes }: { categorizedDishes: CategorizedDishes }) {
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [results, setResults] = useState<ResultSlot[]>(
    CATEGORY_ORDER.map((c) => ({ category: c.key, label: c.label, icon: c.icon, dish: null })),
  );
  const [spinTarget, setSpinTarget] = useState(-1);
  const [wheelItems, setWheelItems] = useState<string[]>([]);
  const [currentPool, setCurrentPool] = useState<Dish[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const restoredRef = useRef(false);

  const isSpinning = phase.startsWith("spinning_");

  // Restore spin results from localStorage on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const savedIds = loadSpinResult();
    if (!savedIds || savedIds.length === 0) return;

    const allDishes = [...categorizedDishes.meat, ...categorizedDishes.vegetable, ...categorizedDishes.soup];
    const restored: ResultSlot[] = CATEGORY_ORDER.map((cat) => {
      const dishId = savedIds[CATEGORY_ORDER.indexOf(cat)];
      const dish = allDishes.find((d) => d.id === dishId) ?? null;
      return { category: cat.key, label: cat.label, icon: cat.icon, dish };
    });

    if (restored.some((r) => r.dish)) {
      setResults(restored);
      setPhase("done");
    }
  }, [categorizedDishes]);

  const getCurrentCategory = useCallback((): "meat" | "vegetable" | "soup" | null => {
    if (phase === "spinning_meat") return "meat";
    if (phase === "spinning_vegetable") return "vegetable";
    if (phase === "spinning_soup") return "soup";
    return null;
  }, [phase]);

  const startSpin = useCallback(
    (category: "meat" | "vegetable" | "soup") => {
      const pool = categorizedDishes[category].filter((d) => !excludedIds.has(d.id));
      if (pool.length === 0) {
        // Skip this category
        return null;
      }

      const { index, dish } = weightedRandomPick(pool);
      const names = pool.map((d) => d.name);

      setCurrentPool(pool);
      setWheelItems(names);
      setSpinTarget(index);
      setExcludedIds((prev) => new Set(prev).add(dish.id));

      return dish;
    },
    [categorizedDishes, excludedIds],
  );

  const handleStart = useCallback(() => {
    setResults(CATEGORY_ORDER.map((c) => ({ category: c.key, label: c.label, icon: c.icon, dish: null })));
    setExcludedIds(new Set());

    const meatDish = startSpin("meat");
    if (meatDish) {
      setPhase("spinning_meat");
    } else {
      // No meat dishes, try vegetable
      const vegDish = startSpin("vegetable");
      if (vegDish) {
        setPhase("spinning_vegetable");
      } else {
        const soupDish = startSpin("soup");
        if (soupDish) {
          setPhase("spinning_soup");
        }
      }
    }
  }, [startSpin]);

  const advancePhase = useCallback(() => {
    const current = getCurrentCategory();
    if (!current) return;

    // Save the result for current category
    const dish = currentPool[spinTarget] ?? null;
    if (dish) {
      setResults((prev) =>
        prev.map((r) => (r.category === current ? { ...r, dish } : r)),
      );
    }

    // Move to reveal, then next spin
    if (current === "meat") {
      setPhase("reveal_meat");
      setTimeout(() => {
        const vegDish = startSpin("vegetable");
        if (vegDish) {
          setPhase("spinning_vegetable");
        } else {
          const soupDish = startSpin("soup");
          setPhase(soupDish ? "spinning_soup" : "done");
        }
      }, 800);
    } else if (current === "vegetable") {
      setPhase("reveal_vegetable");
      setTimeout(() => {
        const soupDish = startSpin("soup");
        if (soupDish) {
          setPhase("spinning_soup");
        } else {
          setPhase("done");
        }
      }, 800);
    } else if (current === "soup") {
      setPhase("reveal_soup");
      setTimeout(() => {
        setPhase("done");
      }, 800);
    }
  }, [getCurrentCategory, currentPool, spinTarget, startSpin]);

  // Save results to localStorage when done
  useEffect(() => {
    if (phase !== "done") return;
    const ids = CATEGORY_ORDER.map((cat) => {
      const slot = results.find((r) => r.category === cat.key);
      return slot?.dish?.id ?? "";
    });
    if (ids.some((id) => id)) saveSpinResult(ids);
  }, [phase, results]);

  const handleReset = useCallback(() => {
    clearSpinResult();
    setPhase("idle");
    setResults(CATEGORY_ORDER.map((c) => ({ category: c.key, label: c.label, icon: c.icon, dish: null })));
    setSpinTarget(-1);
    setWheelItems([]);
    setCurrentPool([]);
    setExcludedIds(new Set());
  }, []);

  const hasResults = results.some((r) => r.dish);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Slot display */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {results.map((slot) => (
          <Card
            key={slot.category}
            className={`overflow-hidden rounded-2xl transition-all duration-300 ${
              slot.dish
                ? "ring-2 ring-orange-400 shadow-md"
                : "border-dashed border-2 border-gray-200"
            }`}
          >
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-2xl mb-1">{slot.icon}</div>
              <div className="text-xs font-medium text-gray-500 mb-2">{slot.label}</div>
              {slot.dish ? (
                <div className="space-y-1">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-xl overflow-hidden bg-orange-50">
                    {slot.dish.image_url ? (
                      <Image
                        src={(() => {
                          try {
                            const urls = JSON.parse(slot.dish.image_url);
                            return Array.isArray(urls) ? urls[0] : slot.dish.image_url;
                          } catch {
                            return slot.dish.image_url;
                          }
                        })()}
                        alt={slot.dish.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-orange-200" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {slot.dish.name}
                  </p>
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-xl bg-gray-50 flex items-center justify-center">
                  <span className="text-3xl text-gray-300">?</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spin wheel area */}
      <div className="flex flex-col items-center gap-4 md:gap-6">
        {isSpinning || phase === "idle" ? (
          <SpinWheel
            items={wheelItems.length > 0 ? wheelItems : ["等待抽取..."]}
            spinning={isSpinning}
            targetIndex={spinTarget}
            onSpinEnd={advancePhase}
          />
        ) : null}

        {phase === "idle" && (
          <Button
            onClick={handleStart}
            size="lg"
            className="rounded-full px-8 py-6 text-lg font-bold bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all"
          >
            <UtensilsCrossed className="w-5 h-5 mr-2" />
            开始转盘
          </Button>
        )}

        {isSpinning && (
          <div className="flex items-center gap-2 text-orange-600">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">
              正在抽取{
                phase === "spinning_meat" ? "荤菜" :
                phase === "spinning_vegetable" ? "素菜" : "汤品"
              }...
            </span>
          </div>
        )}

        {(phase.startsWith("reveal_") || phase === "done") && !isSpinning && phase !== "idle" && (
          <div className="text-sm text-green-600 font-medium">
            {phase === "done" ? "转盘完成！" : "抽到了！"}
          </div>
        )}
      </div>

      {/* Done state: result cards + actions */}
      {phase === "done" && hasResults && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">今日菜单</h2>
            <p className="text-sm text-gray-500 mt-1">一荤一素一汤，轻松搞定</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {results
              .filter((r) => r.dish)
              .map((slot, i) => (
                <Card
                  key={slot.category}
                  className="overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="aspect-[4/3] relative bg-gradient-to-br from-orange-100 to-amber-50">
                    {slot.dish!.image_url ? (
                      <Image
                        src={(() => {
                          try {
                            const urls = JSON.parse(slot.dish!.image_url!);
                            return Array.isArray(urls) ? urls[0] : slot.dish!.image_url!;
                          } catch {
                            return slot.dish!.image_url!;
                          }
                        })()}
                        alt={slot.dish!.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-orange-200" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                      {slot.label}
                    </Badge>
                  </div>

                  <CardContent className="p-3 md:p-4">
                    <h3 className="font-bold text-base md:text-lg mb-1">{slot.dish!.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">
                      {slot.dish!.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {slot.dish!.dish_tags?.slice(0, 3).map((t) => (
                        <Badge key={t.tag} variant="secondary" className="text-xs">
                          {t.tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {slot.dish!.cooking_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{slot.dish!.cooking_time_minutes}分钟</span>
                        </div>
                      )}
                      {slot.dish!.spice_level > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          <span>辣度 {slot.dish!.spice_level}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <AddToCartButton
                        dishId={slot.dish!.id}
                        name={slot.dish!.name}
                        slug={slot.dish!.slug}
                        imageUrl={slot.dish!.image_url}
                        variant="outline"
                        className="flex-1"
                      />
                      <Button
                        render={<Link href={`/menu/${slot.dish!.slug}`} />}
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                      >
                        详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="rounded-full px-6"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新转盘
            </Button>
            <Button
              render={<Link href="/order" />}
              nativeButton={false}
              size="lg"
              className="rounded-full px-6 bg-orange-500 hover:bg-orange-600"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              去下单
            </Button>
          </div>
        </div>
      )}

      {/* Empty state when some categories have no dishes */}
      {phase === "idle" && (
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>
            荤菜 {categorizedDishes.meat.length} 道 ·
            素菜 {categorizedDishes.vegetable.length} 道 ·
            汤品 {categorizedDishes.soup.length} 道
          </p>
          {categorizedDishes.meat.length === 0 && categorizedDishes.vegetable.length === 0 && categorizedDishes.soup.length === 0 && (
            <p className="text-orange-500">暂无可抽取的菜品，请先添加菜品</p>
          )}
        </div>
      )}
    </div>
  );
}
