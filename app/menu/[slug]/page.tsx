import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Clock, Flame, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PublicAttachments } from "@/components/public-attachments";
import { getDishBySlug } from "@/lib/dishes/queries";
import { getDishImageUrls } from "@/lib/dishes/types";
import { DishImageGallery } from "@/components/dish-image-gallery";
import { BackButton } from "@/components/back-button";
import { AudioPlayer } from "@/components/audio-player";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const dish = await getDishBySlug(slug);

  if (!dish) {
    return { title: "菜品不存在" };
  }

  return {
    title: `${dish.name} | AI 私厨电子菜单`,
    description: dish.description,
  };
}

export default async function DishDetailPage({ params }: Props) {
  const { slug } = await params;
  const dish = await getDishBySlug(slug);

  if (!dish) {
    notFound();
  }

  const difficultyMap: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };

  const chef = dish.profiles;

  const imageUrls = getDishImageUrls(dish.image_url);

  // 检查厨师是否有声音样本
  let chefHasVoice = false;
  if (chef) {
    try {
      const supabase = await createClient();
      const { data: chefProfile } = await supabase
        .from("profiles")
        .select("voice_clone_enabled, audio_sample")
        .eq("id", chef.id)
        .single();
      chefHasVoice = !!(chefProfile?.voice_clone_enabled && chefProfile?.audio_sample);
    } catch {
      // 忽略错误
    }
  }

  // 检查当前用户是否是菜品作者
  let isOwner = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && dish.created_by === user.id) {
      isOwner = true;
    }
  } catch (error) {
    // 忽略错误，isOwner 保持 false
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton />

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <DishImageGallery images={imageUrls} dishName={dish.name} />

            <div className="p-4 md:p-8">
              {chef && (
                <Link
                  href={`/chefs/${chef.id}`}
                  className="inline-flex items-center gap-2 mb-4 p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
                    {chef.avatar_url ? (
                      <Image
                        src={chef.avatar_url}
                        alt={chef.display_name || "厨师"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ChefHat className="h-5 w-5 text-orange-400 m-auto mt-2.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {chef.display_name || "匿名厨师"}
                    </p>
                    <p className="text-xs text-gray-500">查看厨师风采</p>
                  </div>
                </Link>
              )}

              <h1 className="text-2xl md:text-3xl font-bold mb-2">{dish.name}</h1>
              <p className="text-sm md:text-base text-gray-600 mb-4">{dish.description}</p>

              {dish.story && (
                <div className="bg-orange-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-xs md:text-sm text-gray-700 italic">
                    &ldquo;{dish.story}&rdquo;
                  </p>
                </div>
              )}

              <div className="mb-4 md:mb-6">
                <AudioPlayer dishId={dish.id} chefHasVoice={chefHasVoice} />
              </div>

              <div className="flex flex-wrap gap-3 md:gap-4 mb-4 md:mb-6 text-xs md:text-sm text-gray-600">
                {dish.cooking_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>{dish.cooking_time_minutes}分钟</span>
                  </div>
                )}
                {dish.spice_level > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
                    <span>辣度 {dish.spice_level}/5</span>
                  </div>
                )}
                {dish.servings && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>适合 {dish.servings} 人</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>难度: {difficultyMap[dish.difficulty]}</span>
                </div>
                {dish.cuisine && (
                  <div className="flex items-center gap-1">
                    <span>菜系: {dish.cuisine}</span>
                  </div>
                )}
              </div>

              {dish.dish_tags && dish.dish_tags.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h3 className="font-medium mb-2 text-sm md:text-base">风味标签</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {dish.dish_tags.map((tag: { id: string; tag: string }) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {dish.dish_ingredients && dish.dish_ingredients.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-sm md:text-base">食材</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dish.dish_ingredients.map((item: {
                      id: string;
                      amount?: string | null;
                      ingredients: { name: string };
                    }) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs md:text-sm"
                      >
                        <span>{item.ingredients.name}</span>
                        {item.amount && (
                          <span className="text-gray-500">{item.amount}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 公开附录区域 - 由客户端组件加载 */}
        <div className="container mx-auto px-4 max-w-4xl">
          <PublicAttachments dishId={dish.id} isOwner={isOwner} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
