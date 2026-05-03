import { generateText } from "ai";
import { z } from "zod";
import { RecommendationSchema } from "@/lib/ai/schemas";
import { getAvailableDishes } from "@/lib/dishes/queries";
import { getAIProvider } from "@/lib/ai/provider";
import type { Dish } from "@/lib/dishes/types";

function extractJson(text: string) {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

/**
 * Local scoring: lightweight heuristic to narrow down candidates.
 * No LLM involved — just deterministic matching.
 */
function localScore(
  dish: {
    tags: string[];
    ingredients: string[];
    spiceLevel: number;
    cookingTime: number | null;
    avoidIngredients: string[];
    preferredFlavors: string[];
    userIngredients: string[];
    maxCookingTime: number | null;
    preferredSpiceLevel: number | null;
  },
) {
  const { tags, ingredients, spiceLevel, cookingTime, avoidIngredients, preferredFlavors, userIngredients, maxCookingTime, preferredSpiceLevel } = dish;

  // Hard-exclude: avoided ingredient
  if (avoidIngredients.length > 0 && ingredients.length > 0) {
    const hasAvoid = avoidIngredients.some((a) =>
      ingredients.some((i) => i.includes(a) || a.includes(i))
    );
    if (hasAvoid) return { score: 0, matched: [] as string[], missing: [] as string[], excluded: true };
  }

  // Matched user ingredients
  const matched = userIngredients.filter((u) =>
    ingredients.some((i) => i.includes(u) || u.includes(i))
  );

  // Missing required ingredients (all ingredients assumed required for simplicity)
  const missing = ingredients.filter((i) =>
    !userIngredients.some((u) => i.includes(u) || u.includes(i))
  );

  // Ingredient score
  const ingredientScore = userIngredients.length > 0
    ? matched.length / userIngredients.length
    : 0.3;

  // Flavor score
  const flavorMatches = preferredFlavors.filter((f) =>
    tags.some((t) => t.includes(f) || f.includes(t))
  );
  const flavorScore = preferredFlavors.length > 0
    ? flavorMatches.length / preferredFlavors.length
    : 0.3;

  // Time score
  let timeScore = 0.5;
  if (maxCookingTime && cookingTime) {
    timeScore = cookingTime <= maxCookingTime
      ? 1
      : Math.max(0, 1 - (cookingTime - maxCookingTime) / 60);
  }

  // Spice score
  let spiceScore = 0.5;
  if (preferredSpiceLevel !== null && preferredSpiceLevel !== undefined) {
    const diff = Math.abs(spiceLevel - preferredSpiceLevel);
    spiceScore = Math.max(0, 1 - diff / 5);
  }

  const rawScore = ingredientScore * 0.4 + flavorScore * 0.3 + timeScore * 0.15 + spiceScore * 0.15;

  return { score: Math.round(rawScore * 100), matched, missing, excluded: false };
}

/**
 * Quick keyword extraction from natural language.
 * No LLM — just regex-based heuristics to pull out flavors, ingredients, and constraints.
 */
function quickParseInput(message: string) {
  const text = message.toLowerCase();

  // Common flavor keywords
  const flavorPatterns = ["辣", "酸", "甜", "咸", "鲜", "麻", "清淡", "下饭", "重口", "微辣", "中辣", "特辣"];
  const flavors = flavorPatterns.filter((f) => text.includes(f));

  // Common ingredient keywords (non-exhaustive, just common ones)
  const ingredientPatterns = [
    "鸡蛋", "土豆", "牛肉", "猪肉", "鸡肉", "鱼", "虾", "豆腐", "番茄", "西红柿",
    "青椒", "茄子", "白菜", "菠菜", "芹菜", "洋葱", "大蒜", "生姜", "米饭", "面条",
    "排骨", "羊肉", "鸭", "蘑菇", "木耳", "胡萝卜", "黄瓜", "南瓜", "玉米", "花生",
  ];
  const availableIngredients = ingredientPatterns.filter((i) => text.includes(i));

  // Avoid ingredients
  const avoidIngredients: string[] = [];
  if (text.includes("不吃肉") || text.includes("不要肉")) avoidIngredients.push("肉");
  if (text.includes("不吃辣") || text.includes("不要辣")) { avoidIngredients.push("辣"); }
  if (text.includes("不吃海鲜")) avoidIngredients.push("海鲜");
  if (text.includes("不吃鸡蛋")) avoidIngredients.push("鸡蛋");

  // Cooking time
  let maxCookingTime: number | null = null;
  const timeMatch = text.match(/(\d+)\s*(?:分钟|分钟以内|分)/);
  if (timeMatch) maxCookingTime = parseInt(timeMatch[1]);

  // Spice level
  let preferredSpiceLevel: number | null = null;
  if (text.includes("特辣")) preferredSpiceLevel = 5;
  else if (text.includes("中辣")) preferredSpiceLevel = 3;
  else if (text.includes("微辣") || text.includes("一点辣")) preferredSpiceLevel = 2;
  else if (text.includes("辣")) preferredSpiceLevel = 3;

  return { flavors, availableIngredients, avoidIngredients, maxCookingTime, preferredSpiceLevel };
}

export async function recommendDishesFromMessage(message: string) {
  const { model } = getAIProvider();

  // Step 1: Quick local parse (no LLM)
  const parsed = quickParseInput(message);

  // Step 2: Fetch all dishes and score locally
  const dishes: Dish[] = await getAvailableDishes();

  const scored = dishes
    .map((dish) => {
      const dishIngredients = dish.dish_ingredients?.map((i) => i.ingredients.name) ?? [];
      const dishTags = dish.dish_tags?.map((t) => t.tag) ?? [];

      const result = localScore({
        tags: dishTags,
        ingredients: dishIngredients,
        spiceLevel: dish.spice_level,
        cookingTime: dish.cooking_time_minutes ?? null,
        avoidIngredients: parsed.avoidIngredients,
        preferredFlavors: parsed.flavors,
        userIngredients: parsed.availableIngredients,
        maxCookingTime: parsed.maxCookingTime,
        preferredSpiceLevel: parsed.preferredSpiceLevel,
      });

      return { dish, ...result };
    })
    .filter((item) => !item.excluded && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (scored.length === 0) {
    return {
      summary: "暂时没有找到特别匹配的菜品。你可以换一种口味描述，或者让朋友再上传几道菜。",
      recommendations: [],
    };
  }

  // Step 3: Single LLM call — preference understanding + recommendation
  const candidatePayload = scored.map((item) => ({
    id: item.dish.id,
    name: item.dish.name,
    desc: item.dish.description,
    tags: item.dish.dish_tags?.map((t) => t.tag) ?? [],
    spice: item.dish.spice_level,
    time: item.dish.cooking_time_minutes,
    ingredients: item.dish.dish_ingredients?.map((i) => i.ingredients.name) ?? [],
    score: item.score,
    matched: item.matched,
    missing: item.missing,
  }));

  const allowedIds = candidatePayload.map((d) => d.id);

  const { text } = await generateText({
    model,
    system: `你是一个有朋友感的 AI 私厨菜单推荐助手。

规则：
1. 只从候选菜品中推荐，不要编造。
2. 输出的 dishId 必须在允许列表中。
3. 推荐理由要具体，说明为什么适合用户。
4. 最多推荐 5 道。
5. 语气自然，像朋友推荐，不要像广告。

允许的 dishId：${allowedIds.join(", ")}

输出 JSON：
{
  "recommendations": [
    { "dishId": "...", "score": 85, "reason": "...", "matchedIngredients": [...], "missingIngredients": [...] }
  ],
  "summary": "整体推荐总结"
}`,
    prompt: `用户说：${message}

候选菜品：
${JSON.stringify(candidatePayload, null, 2)}

请选择最合适的 3-5 道，输出 JSON。`,
  });

  try {
    const jsonStr = extractJson(text);
    const output = RecommendationSchema.parse(JSON.parse(jsonStr));

    const safe = output.recommendations
      .filter((r) => allowedIds.includes(r.dishId))
      .sort((a, b) => b.score - a.score);

    return { summary: output.summary, recommendations: safe };
  } catch {
    return { summary: "推荐分析完成，但结果解析失败，请重试。", recommendations: [] };
  }
}
