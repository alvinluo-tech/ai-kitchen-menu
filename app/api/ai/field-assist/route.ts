import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { getAIProvider } from "@/lib/ai/provider";
import { requireChef } from "@/lib/auth";

const RequestSchema = z.object({
  field: z.enum(["description", "story", "tags"]),
  currentValue: z.string().optional(),
  keywords: z.string().optional(),
  dishContext: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    cuisine: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
  }).optional(),
  action: z.enum(["generate", "rewrite", "expand", "shorten"]).default("generate"),
  tone: z.enum(["warm", "simple", "friendly", "menu"]).default("friendly"),
});

const toneMap = {
  warm: "温暖、有感情，像在回忆一段美好的味道",
  simple: "简洁明了，直接说重点",
  friendly: "自然亲切，像朋友在聊天",
  menu: "专业但不冰冷，像餐厅菜单的描述",
};

const fieldPrompts = {
  description: {
    system: "你是一个菜品描述助手。根据用户提供的信息，生成一段简洁有力的菜品简介（1-2句话）。",
    generate: "根据以下关键词生成菜品描述：",
    rewrite: "把这段描述改写得更{tone}：",
    expand: "根据以下内容扩写成完整的菜品描述：",
    shorten: "把这段描述简化，保留核心信息：",
  },
  story: {
    system: "你是一个有温度的文案助手。根据用户提供的信息，生成一句有感情的菜品故事，像朋友在分享自己的拿手菜。",
    generate: "根据以下关键词生成一句有温度的菜品故事：",
    rewrite: "把这句话改写得更{tone}：",
    expand: "根据以下内容扩写成一句完整的菜品故事：",
    shorten: "把这句话简化，保留情感核心：",
  },
  tags: {
    system: "你是一个菜品标签助手。根据用户提供的信息，生成适合用于搜索和推荐的风味标签（最多6个）。",
    generate: "根据以下信息生成菜品标签，输出JSON数组格式：",
    rewrite: "重新生成更合适的标签，输出JSON数组格式：",
    expand: "在现有标签基础上补充更多标签，输出JSON数组格式：",
    shorten: "精简标签，保留最核心的，输出JSON数组格式：",
  },
};

export async function POST(request: Request) {
  try {
    const { isChef } = await requireChef();

    if (!isChef) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "参数错误" },
        { status: 400 }
      );
    }

    const { field, currentValue, keywords, dishContext, action, tone } = parsed.data;
    const { model } = getAIProvider();

    const fieldConfig = fieldPrompts[field];
    let userPrompt = "";

    const contextParts = [];
    if (dishContext?.name) contextParts.push(`菜名：${dishContext.name}`);
    if (dishContext?.description) contextParts.push(`描述：${dishContext.description}`);
    if (dishContext?.cuisine) contextParts.push(`菜系：${dishContext.cuisine}`);
    if (dishContext?.ingredients?.length) contextParts.push(`食材：${dishContext.ingredients.join("、")}`);

    const contextStr = contextParts.length > 0 ? `\n${contextParts.join("\n")}` : "";

    if (field === "tags") {
      // 标签根据表单内容自动生成
      userPrompt = `请根据以下菜品信息生成风味标签（最多6个）：${contextStr}`;
    } else if (action === "generate" && keywords) {
      userPrompt = `${fieldConfig.generate}\n关键词：${keywords}${contextStr}`;
    } else if (action === "rewrite" && currentValue) {
      userPrompt = `${fieldConfig.rewrite.replace("{tone}", toneMap[tone])}\n原文：${currentValue}${contextStr}`;
    } else if (action === "expand" && currentValue) {
      userPrompt = `${fieldConfig.expand}\n原文：${currentValue}${contextStr}`;
    } else if (action === "shorten" && currentValue) {
      userPrompt = `${fieldConfig.shorten}\n原文：${currentValue}`;
    } else {
      userPrompt = `请根据以下信息生成内容：${keywords || currentValue || ""}${contextStr}`;
    }

    if (field === "tags") {
      userPrompt += "\n\n输出格式：[\"标签1\", \"标签2\", ...]，只输出JSON数组，不要其他内容。";
    }

    const { text } = await generateText({
      model,
      system: fieldConfig.system + "\n只输出结果，不要输出其他内容。",
      prompt: userPrompt,
    });

    let result: string | string[] = text.trim();

    if (field === "tags") {
      try {
        const jsonMatch = text.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch {
        result = text.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
      }
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Field assist error:", error);
    return NextResponse.json(
      { error: "AI 助写失败，请稍后再试" },
      { status: 500 }
    );
  }
}
