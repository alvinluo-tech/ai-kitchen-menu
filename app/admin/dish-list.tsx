"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteDishButton } from "./delete-dish-button";

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

export function DishList({ dishes }: DishListProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      {dishes.map((dish) => (
        <Link
          key={dish.id}
          href={`/menu/${dish.slug}`}
          className="block"
        >
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {dish.image_url ? (
                <Image
                  src={dish.image_url}
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
                <Badge
                  variant={dish.is_available ? "default" : "secondary"}
                  className="text-xs"
                >
                  {dish.is_available ? "可点" : "下架"}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-500 truncate">
                {dish.description}
              </p>
            </div>

            <div
              className="flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              <Link href={`/menu/${dish.slug}`} onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/admin/dishes/${dish.id}/edit`} onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <DeleteDishButton dishId={dish.id} dishName={dish.name} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
