import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pinyin } from "pinyin-pro";

function generateSlug(name: string): string {
  // 将中文转换为拼音
  const pinyinResult = pinyin(name, { toneType: "none", type: "array" }).join("");
  // 清理并格式化
  return pinyinResult
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const DishSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
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

async function generateUniqueSlug(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, name: string): Promise<string> {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from("dishes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const parsed = DishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请填写完整的菜品信息" },
        { status: 400 }
      );
    }

    const { ingredients, tags, attachments, slug: _, ...dishData } = parsed.data;

    // 自动生成 slug
    const slug = _ || await generateUniqueSlug(supabase, dishData.name);

    const { data: dish, error: dishError } = await supabase
      .from("dishes")
      .insert({
        ...dishData,
        slug,
        image_url: dishData.image_url || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (dishError) {
      return NextResponse.json({ error: dishError.message }, { status: 500 });
    }

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
          dish_id: dish.id,
          ingredient_id: existingIngredient.id,
          amount: ingredient.amount || null,
          is_required: ingredient.is_required,
        });
      }
    }

    for (const tag of tags) {
      await supabase.from("dish_tags").insert({
        dish_id: dish.id,
        tag,
      });
    }

    // 保存附件
    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        if (attachment.title || attachment.content || attachment.image_url) {
          await supabase.from("dish_attachments").insert({
            dish_id: dish.id,
            title: attachment.title || null,
            content: attachment.content || null,
            image_url: attachment.image_url || null,
            is_public: attachment.is_public,
            sort_order: i,
          });
        }
      }
    }

    return NextResponse.json({ dish }, { status: 201 });
  } catch (error) {
    console.error("Failed to create dish:", error);
    return NextResponse.json(
      { error: "创建菜品失败" },
      { status: 500 }
    );
  }
}
