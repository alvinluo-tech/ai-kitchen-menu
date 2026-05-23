import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlateSpin } from "@/components/plate-spin";
import { getAvailableDishes } from "@/lib/dishes/queries";
import { classifyDish } from "@/lib/dishes/classify";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "转盘抽取 | AI 私厨电子菜单",
  description: "转一转，今天吃什么？随机抽取荤素汤搭配",
};

export default async function PlatePage() {
  const dishes = await getAvailableDishes();

  const categorized = {
    meat: dishes.filter((d) => classifyDish(d) === "meat"),
    vegetable: dishes.filter((d) => classifyDish(d) === "vegetable"),
    soup: dishes.filter((d) => classifyDish(d) === "soup"),
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">今天吃什么？</h1>
            <p className="text-gray-600 text-sm md:text-base">
              转动转盘，随机抽取一荤一素一汤，轻松搞定一餐
            </p>
          </div>
          <PlateSpin categorizedDishes={categorized} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
