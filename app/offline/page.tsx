import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, Home, UtensilsCrossed } from "lucide-react";

export const metadata = {
  title: "离线 | AI 私厨电子菜单",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-8 w-8 text-orange-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          当前处于离线状态
        </h1>

        <p className="text-gray-600 mb-8">
          网络连接不可用，请检查网络后重试。
          <br />
          已缓存的页面仍然可以浏览。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              浏览菜单
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
