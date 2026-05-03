import { createClient } from "@/lib/supabase/server";
import { ChefsPageClient } from "@/components/chefs-page-client";

export const dynamic = "force-dynamic";

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

  const chefsWithDetails = await Promise.all(
    profiles.map(async (profile) => {
      const { count } = await supabase
        .from("dishes")
        .select("*", { count: "exact", head: true })
        .eq("created_by", profile.id)
        .eq("is_available", true);

      const { data: dishes } = await supabase
        .from("dishes")
        .select("id, name, slug, image_url, description")
        .eq("created_by", profile.id)
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(4);

      return {
        ...profile,
        dish_count: count ?? 0,
        dishes: dishes ?? [],
      };
    })
  );

  return chefsWithDetails;
}

export default async function ChefsPage() {
  const chefs = await getChefProfiles();

  return <ChefsPageClient chefs={chefs} />;
}
