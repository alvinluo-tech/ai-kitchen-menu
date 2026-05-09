"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Clock, ChefHat, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { loadOrders, type OrderRecord } from "@/lib/order-history";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(loadOrders());
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/order" className="p-1 -ml-1">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              点单记录
            </h1>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有点单记录</p>
              <Link href="/menu">
                <Button>去点菜</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {order.note && (
                    <div className="px-4 py-2 bg-orange-50 text-sm text-orange-700">
                      备注：{order.note}
                    </div>
                  )}

                  <div className="p-3 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.dishId} className="flex items-center gap-3">
                        <Link
                          href={`/menu/${item.slug}`}
                          className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat className="h-4 w-4 text-orange-200" />
                            </div>
                          )}
                        </Link>
                        <Link
                          href={`/menu/${item.slug}`}
                          className="flex-1 text-sm font-medium hover:text-orange-600 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <span className="text-sm text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link href="/order">
              <Button variant="outline" className="w-full gap-2">
                <ShoppingCart className="h-4 w-4" />
                去下单
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
