import { createClient } from "@/lib/supabase/server";

const DISH_SELECT = `
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
  ),
  profiles!created_by (
    id,
    display_name,
    avatar_url
  )
`;

export async function getAvailableDishes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(DISH_SELECT)
    .eq("is_available", true)
    .eq("status", "published")
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
    .select(DISH_SELECT)
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
    .select(DISH_SELECT)
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
    .select(DISH_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getChefDishes(chefId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(DISH_SELECT)
    .eq("created_by", chefId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getChefDrafts(chefId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dishes")
    .select(DISH_SELECT)
    .eq("created_by", chefId)
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function publishDish(dishId: string, chefId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dishes")
    .update({ status: "published" })
    .eq("id", dishId)
    .eq("created_by", chefId)
    .eq("status", "draft");

  if (error) {
    throw new Error(error.message);
  }
}

export async function unpublishDish(dishId: string, chefId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dishes")
    .update({ status: "draft" })
    .eq("id", dishId)
    .eq("created_by", chefId)
    .eq("status", "published");

  if (error) {
    throw new Error(error.message);
  }
}
