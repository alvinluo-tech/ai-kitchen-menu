"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Menu, LayoutDashboard, LogOut, X, ShoppingCart } from "lucide-react";
import { CartSheet } from "@/components/cart-sheet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { PwaInstallButton } from "@/components/pwa-install-button";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/menu", label: "全部菜单" },
  { href: "/plate", label: "装盘抽取" },
  { href: "/recommend", label: "AI 推荐" },
  { href: "/chefs", label: "厨师风采" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsChef(profile?.role === "chef");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsChef(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ChefHat className="h-6 w-6 text-orange-600" />
          <span>私厨菜单</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                pathname === item.href
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <PwaInstallButton />

          <CartSheet />

          {loading ? (
            <div className="w-20 h-9" />
          ) : isChef ? (
            <div className="flex items-center gap-2">
              <Link href="/admin/profile">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChefHat className="h-4 w-4" />
                  个人资料
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant={pathname.startsWith("/admin") && !pathname.startsWith("/admin/orders") ? "default" : "outline"} size="sm" className="gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  后台管理
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant={pathname.startsWith("/admin/orders") ? "default" : "outline"} size="sm" className="gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  订单
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-500">
                厨师入口
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 md:hidden">
          <CartSheet />
          <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setOpen(false)}>
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <span>私厨菜单</span>
                </Link>
              </div>

              <nav className="flex-1 p-4">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  {!loading && (
                    isChef ? (
                      <div className="flex flex-col gap-2">
                        <Link href="/admin/profile" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <ChefHat className="h-4 w-4" />
                            个人资料
                          </Button>
                        </Link>
                        <Link href="/admin" onClick={() => setOpen(false)}>
                          <Button variant={pathname.startsWith("/admin") && !pathname.startsWith("/admin/orders") ? "default" : "outline"} className="w-full justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            后台管理
                          </Button>
                        </Link>
                        <Link href="/admin/orders" onClick={() => setOpen(false)}>
                          <Button variant={pathname.startsWith("/admin/orders") ? "default" : "outline"} className="w-full justify-start gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            订单管理
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-500"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          退出登录
                        </Button>
                      </div>
                    ) : (
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-gray-500">
                          厨师入口
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
}
