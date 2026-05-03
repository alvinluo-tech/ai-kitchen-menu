import { DishCard } from "./dish-card";
import type { Dish } from "@/lib/dishes/types";

type DishGridProps = {
  dishes: Dish[];
};

export function DishGrid({ dishes }: DishGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          name={dish.name}
          slug={dish.slug}
          imageUrl={dish.image_url}
          description={dish.description}
          tags={dish.dish_tags?.map((tag) => tag.tag) ?? []}
          cookingTimeMinutes={dish.cooking_time_minutes}
          spiceLevel={dish.spice_level}
          chef={dish.profiles}
        />
      ))}
    </div>
  );
}
