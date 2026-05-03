import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Award, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DishGrid } from "@/components/dish-grid";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/back-button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .single();

  if (!profile) {
    return { title: "厨师不存在" };
  }

  return {
    title: `${profile.display_name || "匿名厨师"} | 厨师风采`,
    description: `查看${profile.display_name || "匿名厨师"}的个人资料和菜品`,
  };
}

export default async function ChefDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, specialties, years_of_cooking, social_link")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  // 获取厨师的菜品
  const { data: dishes } = await supabase
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
      ),
      profiles!created_by (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq("created_by", id)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <BackButton />

          {/* 厨师资料卡片 */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 md:mb-8">
            <div className="h-32 md:h-48 bg-gradient-to-br from-orange-100 to-amber-50 relative">
              {profile.avatar_url && (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || "厨师"}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="p-4 md:p-8 -mt-12 md:-mt-16 relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center mb-4 overflow-hidden">
                {profile.avatar_url ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name || "厨师"}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <ChefHat className="h-10 w-10 md:h-12 md:w-12 text-orange-400" />
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {profile.display_name || "匿名厨师"}
              </h1>

              {profile.bio && (
                <p className="text-sm md:text-base text-gray-600 mb-4 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-gray-500 mb-4">
                {profile.years_of_cooking && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{profile.years_of_cooking} 年烹饪经验</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{dishes?.length || 0} 道拿手菜</span>
                </div>
              </div>

              {profile.specialties && profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 厨师菜品 */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
              {profile.display_name || "匿名厨师"}的菜品
            </h2>

            {dishes && dishes.length > 0 ? (
              <DishGrid dishes={dishes} />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无菜品</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
