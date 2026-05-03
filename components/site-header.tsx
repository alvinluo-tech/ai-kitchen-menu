"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Menu, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/menu", label: "全部菜单" },
  { href: "/recommend", label: "AI 推荐" },
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
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ChefHat className="h-6 w-6" />
          <span>私厨菜单</span>
        </Link>

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

          {loading ? (
            <div className="w-20 h-9" />
          ) : isChef ? (
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant={pathname.startsWith("/admin") ? "default" : "outline"} size="sm" className="gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  后台管理
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

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-orange-600 ${
                    pathname === item.href
                      ? "text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {!loading && (
                isChef ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      <Button variant={pathname.startsWith("/admin") ? "default" : "outline"} className="w-full gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        后台管理
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full text-gray-500" onClick={() => { handleLogout(); setOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full text-gray-500">
                      厨师入口
                    </Button>
                  </Link>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
