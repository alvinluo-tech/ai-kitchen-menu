"use client";

import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { useState, useCallback, useMemo } from "react";

type AddToCartButtonProps = {
  dishId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  variant?: "default" | "outline" | "icon";
  className?: string;
};

export function AddToCartButton({
  dishId,
  name,
  slug,
  imageUrl,
  variant = "default",
  className,
}: AddToCartButtonProps) {
  const { items, addItem } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = useMemo(() => items.find((i) => i.dishId === dishId), [items, dishId]);
  const quantity = inCart?.quantity ?? 0;

  const handleAdd = useCallback(() => {
    addItem({ dishId, name, slug, imageUrl: imageUrl ?? null });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }, [addItem, dishId, name, slug, imageUrl]);

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          "p-2 rounded-full transition-all",
          added
            ? "bg-orange-500 text-white scale-110"
            : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 shadow-sm border",
          className
        )}
        title="点菜"
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button
      onClick={handleAdd}
      variant={variant}
      className={cn(
        added && "bg-green-500 hover:bg-green-600 text-white border-green-500",
        className
      )}
      size="sm"
    >
      {added ? <Check className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
      {added ? "已添加" : quantity > 0 ? `点菜 (${quantity})` : "点菜"}
    </Button>
  );
}
