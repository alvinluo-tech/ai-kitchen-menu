import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendDishesFromMessage } from "@/lib/ai/recommend";
import { getDishById } from "@/lib/dishes/queries";

const RequestSchema = z.object({
  message: z.string().min(2).max(500),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "请输入更具体的口味或食材描述（2-500字）。",
        },
        { status: 400 }
      );
    }

    const message = parsed.data.message.trim();

    if (message.length < 2) {
      return NextResponse.json(
        { error: "描述太短，请输入更多内容。" },
        { status: 400 }
      );
    }

    const result = await recommendDishesFromMessage(message);

    const recommendationsWithDish = await Promise.all(
      result.recommendations.map(async (rec) => {
        const dish = await getDishById(rec.dishId);
        return {
          ...rec,
          dish,
        };
      })
    );

    return NextResponse.json({
      summary: result.summary,
      recommendations: recommendationsWithDish.filter((rec) => rec.dish !== null),
    });
  } catch (error) {
    console.error("Recommend API error:", error);

    return NextResponse.json(
      {
        error: "AI 推荐暂时失败，请稍后再试。",
      },
      { status: 500 }
    );
  }
}
