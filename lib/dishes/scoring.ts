import type { Dish } from "@/lib/dishes/types";
import type { UserPreference } from "@/lib/ai/schemas";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function getDishIngredients(dish: Dish) {
  return dish.dish_ingredients?.map((item) => item.ingredients.name) ?? [];
}

function getDishTags(dish: Dish) {
  return dish.dish_tags?.map((item) => item.tag) ?? [];
}

export function scoreDish(dish: Dish, preference: UserPreference) {
  const dishIngredients = getDishIngredients(dish).map(normalizeText);
  const dishTags = getDishTags(dish).map(normalizeText);

  const availableIngredients = preference.availableIngredients.map(normalizeText);
  const avoidIngredients = preference.avoidIngredients.map(normalizeText);
  const flavors = preference.flavors.map(normalizeText);

  const hasAvoidIngredient = avoidIngredients.some((ingredient) =>
    dishIngredients.some((dishIngredient) => dishIngredient.includes(ingredient))
  );

  if (hasAvoidIngredient) {
    return {
      score: 0,
      matchedIngredients: [],
      missingIngredients: [],
      excluded: true,
    };
  }

  const matchedIngredients = availableIngredients.filter((ingredient) =>
    dishIngredients.some((dishIngredient) => dishIngredient.includes(ingredient))
  );

  const requiredIngredients =
    dish.dish_ingredients
      ?.filter((item) => item.is_required)
      .map((item) => item.ingredients.name) ?? [];

  const missingIngredients = requiredIngredients.filter((ingredient) => {
    const normalized = normalizeText(ingredient);
    return !availableIngredients.some((available) => normalized.includes(available));
  });

  const ingredientScore =
    availableIngredients.length > 0
      ? matchedIngredients.length / availableIngredients.length
      : 0.3;

  const flavorMatches = flavors.filter((flavor) =>
    dishTags.some((tag) => tag.includes(flavor))
  );

  const flavorScore =
    flavors.length > 0
      ? flavorMatches.length / flavors.length
      : 0.3;

  let timeScore = 0.5;

  if (preference.maxCookingTime && dish.cooking_time_minutes) {
    timeScore =
      dish.cooking_time_minutes <= preference.maxCookingTime
        ? 1
        : Math.max(0, 1 - (dish.cooking_time_minutes - preference.maxCookingTime) / 60);
  }

  let spiceScore = 0.5;

  if (preference.preferredSpiceLevel !== null && preference.preferredSpiceLevel !== undefined) {
    const diff = Math.abs(dish.spice_level - preference.preferredSpiceLevel);
    spiceScore = Math.max(0, 1 - diff / 5);
  }

  const rawScore =
    ingredientScore * 0.4 +
    flavorScore * 0.3 +
    timeScore * 0.15 +
    spiceScore * 0.15;

  return {
    score: Math.round(rawScore * 100),
    matchedIngredients,
    missingIngredients,
    excluded: false,
  };
}

export function getCandidateDishes(dishes: Dish[], preference: UserPreference) {
  return dishes
    .map((dish) => {
      const result = scoreDish(dish, preference);

      return {
        dish,
        ...result,
      };
    })
    .filter((item) => !item.excluded)
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
