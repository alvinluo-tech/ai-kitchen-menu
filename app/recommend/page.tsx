import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiRecommendForm } from "@/components/ai-recommend-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI 推荐 | AI 私厨电子菜单",
  description: "不知道吃什么？让 AI 帮你从朋友的菜单里推荐",
};

export default function RecommendPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">不知道吃什么？</h1>
            <p className="text-gray-600 text-sm md:text-base">
              写下你想吃的味道、现有食材、忌口或今天的心情，
              <br className="hidden sm:block" />
              AI 会从朋友的菜单里帮你挑几道。
            </p>
          </div>

          <AiRecommendForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
