import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DishGrid } from "@/components/dish-grid";
import { EmptyState } from "@/components/empty-state";
import { getAvailableDishes } from "@/lib/dishes/queries";

// 使用ISR，每60秒重新验证一次
export const revalidate = 60;

export const metadata = {
  title: "全部菜单 | AI 私厨电子菜单",
  description: "浏览朋友会做的所有菜品",
};

export default async function MenuPage() {
  let dishes = [];
  try {
    dishes = await getAvailableDishes();
  } catch (error) {
    console.error("Failed to fetch dishes:", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">全部菜单</h1>

          {dishes.length > 0 ? (
            <DishGrid dishes={dishes} />
          ) : (
            <EmptyState
              title="还没有菜品"
              description="朋友还没有上传任何菜品，请稍后再来看看。"
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
