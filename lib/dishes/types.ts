export type Difficulty = "easy" | "medium" | "hard";

export type Ingredient = {
  id: string;
  name: string;
  category?: string | null;
};

export type DishIngredient = {
  id: string;
  amount?: string | null;
  is_required: boolean;
  ingredients: Ingredient;
};

export type DishTag = {
  id: string;
  tag: string;
};

export type ChefInfo = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type Dish = {
  id: string;
  name: string;
  slug: string;
  description: string;
  story?: string | null;
  image_url?: string | null;
  cuisine?: string | null;
  spice_level: number;
  difficulty: Difficulty;
  cooking_time_minutes?: number | null;
  servings?: number | null;
  is_available: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  dish_ingredients?: DishIngredient[];
  dish_tags?: DishTag[];
  profiles?: ChefInfo | null;
};

export type RecommendedDish = Dish & {
  score: number;
  reason: string;
  matchedIngredients: string[];
  missingIngredients: string[];
};
