import Link from "next/link";
import { ArrowRight, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DishGrid } from "@/components/dish-grid";
import { getAvailableDishes } from "@/lib/dishes/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let dishes = [];
  try {
    dishes = await getAvailableDishes();
  } catch (error) {
    console.error("Failed to fetch dishes:", error);
  }

  const recentDishes = dishes.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-gray-900">
              今天想吃什么？
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
              这里不是普通菜谱，而是朋友会做的菜。
              <br className="hidden sm:block" />
              告诉 AI 你想吃的味道和手头的食材，它会从真实菜单里帮你挑出最适合的几道。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button render={<Link href="/recommend" />} size="lg" className="gap-2 w-full sm:w-auto">
                <Sparkles className="h-5 w-5" />
                让 AI 帮我推荐
              </Button>
              <Button render={<Link href="/menu" />} size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <UtensilsCrossed className="h-5 w-5" />
                浏览全部菜单
              </Button>
            </div>
          </div>
        </section>

        {recentDishes.length > 0 && (
          <section className="py-10 md:py-12 bg-white/50">
            <div className="container mx-auto px-4">
              <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6 text-center">
                朋友最近上传的菜
              </h2>
              <DishGrid dishes={recentDishes} />
              <div className="text-center mt-6 md:mt-8">
                <Button render={<Link href="/menu" />} variant="link" className="gap-1">
                  查看全部菜单
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center">
              这个菜单怎么用
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-lg md:text-xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">朋友上传拿手菜</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  朋友把自己会做的菜上传到这里，包括食材、做法和故事
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-lg md:text-xl font-bold text-orange-600">2</span>
                </div>
                <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">你输入今天想吃什么</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  用自然语言描述你想吃的味道、现有食材或者忌口
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-lg md:text-xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">AI 从真实菜单里推荐</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  AI 会从朋友上传的菜里，推荐最适合你的几道
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
