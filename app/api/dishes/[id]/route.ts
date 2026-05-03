import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const DishSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  story: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  cuisine: z.string().optional(),
  spice_level: z.number().min(0).max(5),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cooking_time_minutes: z.number().positive().optional().nullable(),
  servings: z.number().positive().optional().nullable(),
  is_available: z.boolean(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string().optional(),
      is_required: z.boolean(),
    })
  ),
  tags: z.array(z.string()),
  attachments: z.array(
    z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      image_url: z.string().url().optional().or(z.literal("")),
      is_public: z.boolean().default(false),
    })
  ).optional(),
});

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "chef") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 检查菜品所有权
    const { data: existingDish } = await supabase
      .from("dishes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existingDish || existingDish.created_by !== user.id) {
      return NextResponse.json({ error: "无权编辑此菜品" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = DishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请填写完整的菜品信息" },
        { status: 400 }
      );
    }

    const { ingredients, tags, attachments, ...dishData } = parsed.data;

    const { error: dishError } = await supabase
      .from("dishes")
      .update({
        ...dishData,
        image_url: dishData.image_url || null,
      })
      .eq("id", id);

    if (dishError) {
      return NextResponse.json({ error: dishError.message }, { status: 500 });
    }

    await supabase.from("dish_ingredients").delete().eq("dish_id", id);
    await supabase.from("dish_tags").delete().eq("dish_id", id);
    await supabase.from("dish_attachments").delete().eq("dish_id", id);

    for (const ingredient of ingredients) {
      let { data: existingIngredient } = await supabase
        .from("ingredients")
        .select("id")
        .eq("name", ingredient.name)
        .single();

      if (!existingIngredient) {
        const { data: newIngredient } = await supabase
          .from("ingredients")
          .insert({ name: ingredient.name })
          .select()
          .single();
        existingIngredient = newIngredient;
      }

      if (existingIngredient) {
        await supabase.from("dish_ingredients").insert({
          dish_id: id,
          ingredient_id: existingIngredient.id,
          amount: ingredient.amount || null,
          is_required: ingredient.is_required,
        });
      }
    }

    for (const tag of tags) {
      await supabase.from("dish_tags").insert({
        dish_id: id,
        tag,
      });
    }

    // 保存附录
    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        if (attachment.title || attachment.content || attachment.image_url) {
          await supabase.from("dish_attachments").insert({
            dish_id: id,
            title: attachment.title || null,
            content: attachment.content || null,
            image_url: attachment.image_url || null,
            is_public: attachment.is_public,
            sort_order: i,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update dish:", error);
    return NextResponse.json(
      { error: "更新菜品失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "chef") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 检查菜品所有权
    const { data: existingDish } = await supabase
      .from("dishes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existingDish || existingDish.created_by !== user.id) {
      return NextResponse.json({ error: "无权删除此菜品" }, { status: 403 });
    }

    const { error } = await supabase.from("dishes").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete dish:", error);
    return NextResponse.json(
      { error: "删除菜品失败" },
      { status: 500 }
    );
  }
}
