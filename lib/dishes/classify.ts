import type { Dish } from "@/lib/dishes/types";

export type DishCategory = "meat" | "vegetable" | "soup" | "other";

const MEAT_TAGS = ["荤菜", "荤", "肉类", "海鲜", "荤腥"];
const VEG_TAGS = ["素菜", "素", "蔬菜", "素食"];
const SOUP_TAGS = ["汤", "汤品", "煲汤", "羹"];
const MEAT_INGREDIENTS = [
  "猪肉", "牛肉", "羊肉", "鸡肉", "鸭", "鱼", "虾", "蟹",
  "排骨", "鸡蛋", "培根", "腊肉", "香肠", "火腿", "肉",
];

export function classifyDish(dish: Dish): DishCategory {
  const tags = dish.dish_tags?.map((t) => t.tag) ?? [];

  // 1. tag 优先匹配（汤 > 荤 > 素）
  if (tags.some((t) => SOUP_TAGS.some((k) => t.includes(k)))) return "soup";
  if (tags.some((t) => MEAT_TAGS.some((k) => t.includes(k)))) return "meat";
  if (tags.some((t) => VEG_TAGS.some((k) => t.includes(k)))) return "vegetable";

  // 2. 菜名含"汤"/"羹"
  if (dish.name.includes("汤") || dish.name.includes("羹")) return "soup";

  // 3. 食材推断
  const ingredients = dish.dish_ingredients?.map((i) => i.ingredients.name) ?? [];
  const hasMeat = ingredients.some((i) =>
    MEAT_INGREDIENTS.some((m) => i.includes(m)),
  );
  if (hasMeat) return "meat";

  // 4. 有食材但无荤菜标记 → 素菜
  if (ingredients.length > 0) return "vegetable";

  return "other";
}
