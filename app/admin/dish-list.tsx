"use client";

import { useOptimistic, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteDishButton } from "./delete-dish-button";
import { getDishImageUrl } from "@/lib/dishes/types";

type Dish = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
};

type DishListProps = {
  dishes: Dish[];
};

const OPTIMISTIC_KEY = "ai-kitchen-menu:optimistic-dish";

export function DishList({ dishes }: DishListProps) {
  const router = useRouter();
  const [optimisticDishes, removeOptimisticDish] = useOptimistic(
    dishes,
    (current, removedId: string) => current.filter((d) => d.id !== removedId)
  );

  const [pendingDish, setPendingDish] = useState<Dish | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(OPTIMISTIC_KEY);
      if (raw) {
        const entry: Dish = JSON.parse(raw);
        // Only use if recent (within 30 seconds)
        if (Date.now() - (entry as unknown as { createdAt: number }).createdAt < 30000) {
          setPendingDish(entry);
        }
        sessionStorage.removeItem(OPTIMISTIC_KEY);
      }
    } catch {}
  }, []);

  const displayDishes = pendingDish
    ? [pendingDish, ...optimisticDishes.filter((d) => d.id !== pendingDish.id)]
    : optimisticDishes;

  const handleDelete = async (dishId: string) => {
    removeOptimisticDish(dishId);

    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }
    } catch {
      const { toast } = await import("sonner");
      toast.error("删除失败，请重试");
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {displayDishes.map((dish) => (
        <div
          key={dish.id}
          role="button"
          tabIndex={0}
          onClick={() => dish.id !== "pending" && router.push(`/menu/${dish.slug}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              router.push(`/menu/${dish.slug}`);
            }
          }}
          className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {getDishImageUrl(dish.image_url) ? (
              <Image
                src={getDishImageUrl(dish.image_url)!}
                alt={dish.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🍽️</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate text-sm md:text-base">{dish.name}</h3>
              {dish.id === "pending" ? (
                <Badge variant="outline" className="text-xs gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  创建中
                </Badge>
              ) : (
                <Badge
                  variant={dish.is_available ? "default" : "secondary"}
                  className="text-xs"
                >
                  {dish.is_available ? "可点" : "下架"}
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-gray-500 truncate">
              {dish.description}
            </p>
          </div>

          {dish.id !== "pending" && (
            <div
              className="flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.push(`/menu/${dish.slug}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.push(`/admin/dishes/${dish.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <DeleteDishButton dishId={dish.id} dishName={dish.name} onDelete={handleDelete} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
