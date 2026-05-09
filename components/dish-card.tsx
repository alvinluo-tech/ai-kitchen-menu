"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, ChefHat, TrendingUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { memo } from "react";

type DishCardProps = {
  dishId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description: string;
  tags?: string[];
  cookingTimeMinutes?: number | null;
  spiceLevel?: number;
  orderCount?: number;
  score?: number;
  reason?: string;
  matchedIngredients?: string[];
  missingIngredients?: string[];
  rank?: number;
  chef?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const DishCard = memo(function DishCard({
  dishId,
  name,
  slug,
  imageUrl,
  description,
  tags = [],
  cookingTimeMinutes,
  spiceLevel = 0,
  orderCount,
  score,
  reason,
  matchedIngredients = [],
  missingIngredients = [],
  rank,
  chef,
}: DishCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] relative bg-gradient-to-br from-orange-100 to-amber-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-orange-200" />
          </div>
        )}

        {rank !== undefined && rank <= 3 && (
          <div className="absolute top-2 left-2 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {rank}
          </div>
        )}

        {score !== undefined && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs md:text-sm font-medium text-orange-600">
            {score}%
          </div>
        )}

        {chef && (
          <Link
            href={`/chefs/${chef.id}`}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1 hover:bg-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
              {chef.avatar_url ? (
                <Image
                  src={chef.avatar_url}
                  alt={chef.display_name || "厨师"}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ChefHat className="h-3 w-3 text-orange-400 m-auto mt-1" />
              )}
            </div>
            <span className="text-[10px] font-medium text-gray-700 truncate max-w-[60px]">
              {chef.display_name || "匿名"}
            </span>
          </Link>
        )}
      </div>

      <CardContent className="p-3 md:p-4">
        <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-1">{name}</h3>
        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2 md:mb-3">{description}</p>

        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
          {cookingTimeMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span>{cookingTimeMinutes}分钟</span>
            </div>
          )}
          {spiceLevel > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
              <span>辣度 {spiceLevel}</span>
            </div>
          )}
          {orderCount !== undefined && orderCount > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span>{orderCount}次</span>
            </div>
          )}
        </div>

        <div className="mt-2 md:mt-3">
          <AddToCartButton
            dishId={dishId}
            name={name}
            slug={slug}
            imageUrl={imageUrl}
            variant="outline"
          />
        </div>

        {reason && (
          <div className="mt-2 md:mt-3 p-2 md:p-3 bg-orange-50 rounded-lg">
            <p className="text-xs md:text-sm text-gray-700 line-clamp-3">{reason}</p>
          </div>
        )}

        {(matchedIngredients.length > 0 || missingIngredients.length > 0) && (
          <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-gray-500">
            {matchedIngredients.length > 0 && (
              <p className="text-green-600">
                已有: {matchedIngredients.join("、")}
              </p>
            )}
            {missingIngredients.length > 0 && (
              <p className="text-orange-600">
                缺少: {missingIngredients.join("、")}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 md:p-4 pt-0">
        <Button render={<Link href={`/menu/${slug}`} />} variant="outline" className="w-full text-xs md:text-sm h-9 md:h-10">
          查看详情
        </Button>
      </CardFooter>
    </Card>
  );
});
