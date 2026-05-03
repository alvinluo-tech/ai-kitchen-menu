import { NextResponse } from "next/server";
import { z } from "zod";
import { requireChef } from "@/lib/auth";
import { generateDishDraft } from "@/lib/ai/dish-draft";

const RequestSchema = z.object({
  description: z.string().min(5).max(500),
});

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
        { error: "请输入至少 5 个字的描述" },
        { status: 400 }
      );
    }

    const draft = await generateDishDraft(parsed.data.description);

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("AI draft error:", error);
    return NextResponse.json(
      { error: "生成草稿失败，请稍后再试" },
      { status: 500 }
    );
  }
}
