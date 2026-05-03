import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DishForm } from "@/components/dish-form";
import { requireChef } from "@/lib/auth";
import { getDishById } from "@/lib/dishes/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const dish = await getDishById(id);

  if (!dish) {
    return { title: "菜品不存在" };
  }

  return {
    title: `编辑 ${dish.name} | AI 私厨电子菜单`,
  };
}

export default async function EditDishPage({ params }: Props) {
  const { id } = await params;
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

  const dish = await getDishById(id);

  if (!dish) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 md:mb-6 gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              返回后台
            </Button>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">编辑 {dish.name}</h1>

          <DishForm dish={dish} mode="edit" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
