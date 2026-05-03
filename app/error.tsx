"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">出了点问题</h1>
          <p className="text-gray-600 mb-6">
            页面加载时遇到了错误，请尝试刷新页面。
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline">
              重试
            </Button>
            <Button render={<Link href="/" />}>
              返回首页
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
