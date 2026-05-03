import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireChef } from "@/lib/auth";
import { getAllDishes } from "@/lib/dishes/queries";
import { DeleteDishButton } from "./delete-dish-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "后台管理 | AI 私厨电子菜单",
};

export default async function AdminPage() {
  const { isChef } = await requireChef();

  if (!isChef) {
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
    dishes = await getAllDishes();
  } catch (error) {
    console.error("Failed to fetch dishes:", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">后台管理</h1>
            <Link href="/admin/dishes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增菜品
              </Button>
            </Link>
          </div>

          {dishes.length > 0 ? (
            <div className="space-y-4">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {dish.image_url ? (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{dish.name}</h3>
                      <Badge
                        variant={dish.is_available ? "default" : "secondary"}
                      >
                        {dish.is_available ? "可点" : "下架"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {dish.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/dishes/${dish.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteDishButton dishId={dish.id} dishName={dish.name} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">还没有菜品</p>
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
