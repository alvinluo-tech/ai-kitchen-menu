"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, ChevronLeft, ChefHat, Plus, Minus, Trash2,
  Loader2, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function OrderPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalItems, clearCart } = useCart();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            dish_id: item.dishId,
            quantity: item.quantity,
          })),
          customer_note: note || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "下单失败");
      }

      clearCart();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "下单失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 py-6 md:py-8">
          <div className="container mx-auto px-4 max-w-lg">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">下单成功</h1>
              <p className="text-gray-600 mb-6">
                你的点单已提交，厨师会尽快确认
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/menu">
                  <Button variant="outline" className="w-full">继续浏览菜单</Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" className="w-full">返回首页</Button>
                </Link>
              </div>
            </div>
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
        <div className="container mx-auto px-4 max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              确认点单
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有点菜</p>
              <Link href="/menu">
                <Button>去菜单逛逛</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-medium">已点菜品 ({totalItems}道)</h2>
                </div>
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.dishId} className="flex items-center gap-3 p-3">
                      <Link
                        href={`/menu/${item.slug}`}
                        className="w-14 h-14 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0"
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-6 w-6 text-orange-200" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/menu/${item.slug}`}
                          className="text-sm font-medium line-clamp-1 hover:text-orange-600"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.dishId)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  备注（选填）
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="比如：少辣、不要香菜..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full gap-2"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    确认下单
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
