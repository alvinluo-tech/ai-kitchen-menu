import { generateText } from "ai";
import { z } from "zod";
import {
  UserPreferenceSchema,
  RecommendationSchema,
} from "@/lib/ai/schemas";
import { getAvailableDishes } from "@/lib/dishes/queries";
import { getCandidateDishes } from "@/lib/dishes/scoring";
import { xiaomiModel } from "@/lib/ai/xiaomi";

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

export async function recommendDishesFromMessage(message: string) {
  const { text: preferenceText } = await generateText({
    model: xiaomiModel,
    system: `
你是一个菜品偏好解析助手。
你的任务是从用户自然语言中提取偏好，输出 JSON。

必须输出以下格式的 JSON（不要输出其他内容）：
{
  "flavors": ["想吃的风味，如辣、酸、甜"],
  "availableIngredients": ["家里有的食材"],
  "avoidIngredients": ["忌口食材"],
  "avoidStyles": ["不喜欢的风格"],
  "maxCookingTime": null或数字（分钟）,
  "preferredSpiceLevel": null或0到5的数字,
  "peopleCount": null或数字,
  "mood": null或字符串
}

规则：
- 不要编造用户没有表达的信息
- 如果不确定，使用空数组或 null
- 只输出 JSON，不要输出其他内容
`,
    prompt: message,
  });

  let preference;
  try {
    const jsonStr = extractJson(preferenceText);
    preference = UserPreferenceSchema.parse(JSON.parse(jsonStr));
  } catch {
    preference = UserPreferenceSchema.parse({});
  }

  const dishes = await getAvailableDishes();
  const candidates = getCandidateDishes(dishes, preference);

  if (candidates.length === 0) {
    return {
      summary: "暂时没有找到特别匹配的菜品。你可以换一种口味描述，或者让朋友再上传几道菜。",
      recommendations: [],
    };
  }

  const candidatePayload = candidates.map((item) => ({
    dishId: item.dish.id,
    name: item.dish.name,
    description: item.dish.description,
    cuisine: item.dish.cuisine,
    spiceLevel: item.dish.spice_level,
    cookingTimeMinutes: item.dish.cooking_time_minutes,
    tags: item.dish.dish_tags?.map((tag) => tag.tag) ?? [],
    ingredients:
      item.dish.dish_ingredients?.map((ingredient) => ({
        name: ingredient.ingredients.name,
        amount: ingredient.amount,
        isRequired: ingredient.is_required,
      })) ?? [],
    baseScore: item.score,
    matchedIngredients: item.matchedIngredients,
    missingIngredients: item.missingIngredients,
  }));

  const allowedDishIds = candidatePayload.map((dish) => dish.dishId);

  const { text: recommendationText } = await generateText({
    model: xiaomiModel,
    system: `
你是一个温柔、自然、有朋友感的 AI 私厨菜单推荐助手。

重要规则：
1. 你只能从候选菜品中推荐。
2. 你不能编造菜品。
3. 你不能输出候选菜品以外的 dishId。
4. 推荐理由必须具体说明为什么适合用户。
5. 推荐理由要结合用户现有食材、想吃的风味、忌口、烹饪时间和辣度。
6. 输出最多 5 道菜。
7. 如果匹配度一般，也要诚实说明。
8. 语气要自然，像朋友帮忙推荐，不要像外卖广告。

允许推荐的 dishId：
${allowedDishIds.join(", ")}

输出格式（只输出 JSON）：
{
  "recommendations": [
    {
      "dishId": "菜品ID",
      "score": 85,
      "reason": "推荐理由",
      "matchedIngredients": ["匹配的食材"],
      "missingIngredients": ["缺少的食材"]
    }
  ],
  "summary": "整体推荐总结"
}
`,
    prompt: `
用户原始描述：
${message}

解析后的用户偏好：
${JSON.stringify(preference, null, 2)}

候选菜品：
${JSON.stringify(candidatePayload, null, 2)}

请从候选菜品中选择最合适的 3 到 5 道，输出 JSON。
`,
  });

  try {
    const jsonStr = extractJson(recommendationText);
    const output = RecommendationSchema.parse(JSON.parse(jsonStr));

    const safeRecommendations = output.recommendations.filter((item) =>
      allowedDishIds.includes(item.dishId)
    );

    return {
      summary: output.summary,
      recommendations: safeRecommendations,
    };
  } catch {
    return {
      summary: "推荐分析完成，但结果解析失败，请重试。",
      recommendations: [],
    };
  }
}
