import { generateText } from "ai";
import { getAIProvider } from "@/lib/ai/provider";
import { DishDraftSchema, type DishDraft } from "@/lib/ai/dish-draft-schema";
import { extractJson } from "@/lib/utils";

export async function generateDishDraft(description: string): Promise<DishDraft> {
  const { model } = getAIProvider();

  const { text } = await generateText({
    model,
    system: `
你是一个菜品信息助手。
根据厨师的简单描述，生成完整的菜品表单草稿。

必须输出以下格式的 JSON：
{
  "name": "菜品名称",
  "description": "菜品简介，1-2句话，简洁有力",
  "story": "朋友的一句话，有温度的描述，像在跟朋友聊天",
  "cuisine": "菜系，如：家常、川菜、粤菜、湘菜等",
  "spice_level": 0到5的数字，0=不辣，5=极辣,
  "difficulty": "easy" 或 "medium" 或 "hard",
  "cooking_time_minutes": 预估烹饪时间（分钟）,
  "servings": "适合人数，如：3-4、2、4-6",
  "ingredients": [
    {
      "name": "食材名称",
      "amount": "用量，如：2个、300g、适量",
      "is_required": true或false
    }
  ],
  "tags": ["风味标签1", "风味标签2", "最多6个"]
}

规则：
- 根据描述合理推断，但不要过度脑补
- 食材要完整，包括主要食材和常用调料
- 标签要简洁，适合用于搜索和推荐
- 故事要有温度，像朋友在介绍自己的拿手菜
- 只输出 JSON，不要输出其他内容
`,
    prompt: `厨师描述：${description}`,
  });

  try {
    const jsonStr = extractJson(text);
    const parsed = JSON.parse(jsonStr);
    return DishDraftSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse dish draft:", error);
    throw new Error("生成菜品草稿失败，请重试");
  }
}
