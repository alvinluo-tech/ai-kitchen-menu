import { createClient } from "@/lib/supabase/server";

export async function getAvailableDishes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(`
      *,
      dish_ingredients (
        id,
        amount,
        is_required,
        ingredients (
          id,
          name,
          category
        )
      ),
      dish_tags (
        id,
        tag
      )
    `)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getDishBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(`
      *,
      dish_ingredients (
        id,
        amount,
        is_required,
        ingredients (
          id,
          name,
          category
        )
      ),
      dish_tags (
        id,
        tag
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getDishById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(`
      *,
      dish_ingredients (
        id,
        amount,
        is_required,
        ingredients (
          id,
          name,
          category
        )
      ),
      dish_tags (
        id,
        tag
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getAllDishes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(`
      *,
      dish_ingredients (
        id,
        amount,
        is_required,
        ingredients (
          id,
          name,
          category
        )
      ),
      dish_tags (
        id,
        tag
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
