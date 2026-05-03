import { ChefHat } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <ChefHat className="h-5 w-5" />
            <span className="text-sm">AI 私厨电子菜单</span>
          </div>
          <p className="text-sm text-gray-500">
            朋友会做的菜，AI 帮你推荐
          </p>
        </div>
      </div>
    </footer>
  );
}
