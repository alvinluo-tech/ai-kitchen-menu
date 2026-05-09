import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireChef } from "@/lib/auth";
import { getChefDishes } from "@/lib/dishes/queries";
import { DishList } from "./dish-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "后台管理 | AI 私厨电子菜单",
};

export default async function AdminPage() {
  const { user, isChef } = await requireChef();

  if (!isChef || !user) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">无权限</h1>
            <p className="text-gray-600 mb-4">你没有权限访问后台管理页面</p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  let dishes = [];
  try {
    dishes = await getChefDishes(user.id);
  } catch (error) {
    console.error("Failed to fetch dishes:", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">我的菜品</h1>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  订单管理
                </Button>
              </Link>
            </div>
            <Link href="/admin/dishes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增菜品
              </Button>
            </Link>
          </div>

          {dishes.length > 0 ? (
            <DishList dishes={dishes} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">你还没有上传菜品</p>
              <Link href="/admin/dishes/new">
                <Button>新增第一道菜</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
