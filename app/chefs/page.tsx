import { createClient } from "@/lib/supabase/server";
import { ChefsPageClient } from "@/components/chefs-page-client";

// 使用ISR，每60秒重新验证一次
export const revalidate = 60;

export const metadata = {
  title: "厨师风采 | AI 私厨电子菜单",
  description: "认识为你做菜的朋友们",
};

type ChefProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  years_of_cooking: number | null;
  social_link: string | null;
  dish_count?: number;
  dishes?: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    description: string;
  }[];
};

async function getChefProfiles(): Promise<ChefProfile[]> {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, specialties, years_of_cooking, social_link")
    .eq("role", "chef")
    .eq("show_on_showcase", true);

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Optimized: fetch ALL available dishes for these chefs in ONE query
  const chefIds = profiles.map((p) => p.id);
  const { data: allDishes } = await supabase
    .from("dishes")
    .select("id, name, slug, image_url, description, created_by, created_at")
    .eq("is_available", true)
    .in("created_by", chefIds)
    .order("created_at", { ascending: false });

  // Group dishes by chef ID
  const dishesByChef = new Map<string, typeof allDishes>();
  for (const dish of allDishes ?? []) {
    const list = dishesByChef.get(dish.created_by) ?? [];
    list.push(dish);
    dishesByChef.set(dish.created_by, list);
  }

  return profiles.map((profile) => {
    const chefDishes = dishesByChef.get(profile.id) ?? [];
    return {
      ...profile,
      dish_count: chefDishes.length,
      dishes: chefDishes.slice(0, 4),
    };
  });
}

export default async function ChefsPage() {
  const chefs = await getChefProfiles();

  return <ChefsPageClient chefs={chefs} />;
}
