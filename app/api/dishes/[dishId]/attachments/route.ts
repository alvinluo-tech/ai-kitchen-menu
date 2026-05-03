import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const AttachmentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_public: z.boolean().default(false),
  sort_order: z.number().default(0),
});

type Props = {
  params: Promise<{ dishId: string }>;
};

// 获取菜品的所有附件
export async function GET(request: Request, { params }: Props) {
  try {
    const { dishId } = await params;
    const supabase = await createClient();

    // 检查是否是菜品的所有者
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("dish_attachments")
      .select("*")
      .eq("dish_id", dishId)
      .order("sort_order", { ascending: true });

    // 如果不是菜品所有者，只能看公开附件
    if (user) {
      const { data: dish } = await supabase
        .from("dishes")
        .select("created_by")
        .eq("id", dishId)
        .single();

      if (!dish || dish.created_by !== user.id) {
        query = query.eq("is_public", true);
      }
    } else {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attachments: data });
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    return NextResponse.json(
      { error: "获取附件失败" },
      { status: 500 }
    );
  }
}

// 新增附件
export async function POST(request: Request, { params }: Props) {
  try {
    const { dishId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查是否是菜品所有者
    const { data: dish } = await supabase
      .from("dishes")
      .select("created_by")
      .eq("id", dishId)
      .single();

    if (!dish || dish.created_by !== user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = AttachmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请填写附件信息" },
        { status: 400 }
      );
    }

    // 获取当前最大排序值
    const { data: maxSort } = await supabase
      .from("dish_attachments")
      .select("sort_order")
      .eq("dish_id", dishId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sortOrder = parsed.data.sort_order || (maxSort ? maxSort.sort_order + 1 : 0);

    const { data, error } = await supabase
      .from("dish_attachments")
      .insert({
        dish_id: dishId,
        ...parsed.data,
        image_url: parsed.data.image_url || null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attachment: data }, { status: 201 });
  } catch (error) {
    console.error("Failed to create attachment:", error);
    return NextResponse.json(
      { error: "创建附件失败" },
      { status: 500 }
    );
  }
}

// 删除附件
export async function DELETE(request: Request, { params }: Props) {
  try {
    const { dishId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查是否是菜品所有者
    const { data: dish } = await supabase
      .from("dishes")
      .select("created_by")
      .eq("id", dishId)
      .single();

    if (!dish || dish.created_by !== user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("id");

    if (!attachmentId) {
      return NextResponse.json({ error: "缺少附件 ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("dish_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("dish_id", dishId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete attachment:", error);
    return NextResponse.json(
      { error: "删除附件失败" },
      { status: 500 }
    );
  }
}
