import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, ChefHat } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DishCardProps = {
  name: string;
  slug: string;
  imageUrl?: string | null;
  description: string;
  tags?: string[];
  cookingTimeMinutes?: number | null;
  spiceLevel?: number;
  score?: number;
  reason?: string;
  matchedIngredients?: string[];
  missingIngredients?: string[];
};

export function DishCard({
  name,
  slug,
  imageUrl,
  description,
  tags = [],
  cookingTimeMinutes,
  spiceLevel = 0,
  score,
  reason,
  matchedIngredients = [],
  missingIngredients = [],
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
        {score !== undefined && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-orange-600">
            匹配度 {score}%
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {cookingTimeMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{cookingTimeMinutes}分钟</span>
            </div>
          )}
          {spiceLevel > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>辣度 {spiceLevel}</span>
            </div>
          )}
        </div>

        {reason && (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-700">{reason}</p>
          </div>
        )}

        {(matchedIngredients.length > 0 || missingIngredients.length > 0) && (
          <div className="mt-3 text-xs text-gray-500">
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

      <CardFooter className="p-4 pt-0">
        <Link href={`/menu/${slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            查看详情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
