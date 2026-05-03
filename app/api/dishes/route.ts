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
});

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

    const { ingredients, tags, ...dishData } = parsed.data;

    const { data: dish, error: dishError } = await supabase
      .from("dishes")
      .insert({
        ...dishData,
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

    return NextResponse.json({ dish }, { status: 201 });
  } catch (error) {
    console.error("Failed to create dish:", error);
    return NextResponse.json(
      { error: "创建菜品失败" },
      { status: 500 }
    );
  }
}
