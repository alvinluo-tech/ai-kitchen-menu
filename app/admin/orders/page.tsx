import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { requireChef } from "@/lib/auth";
import { OrderList } from "./order-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "订单管理 | AI 私厨电子菜单",
};

export default async function AdminOrdersPage() {
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

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">订单管理</h1>
          <OrderList />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
