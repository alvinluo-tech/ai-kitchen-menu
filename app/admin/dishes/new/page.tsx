import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DishForm } from "@/components/dish-form";
import { requireChef } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "新增菜品 | AI 私厨电子菜单",
};

export default async function NewDishPage() {
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

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/admin">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回后台
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-8">新增菜品</h1>

          <DishForm mode="create" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
