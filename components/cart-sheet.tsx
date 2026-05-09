"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2, ChefHat, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export function CartSheet() {
  const { items, updateQuantity, removeItem, totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        }
      >
        <span className="sr-only">购物车</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            已点菜品
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <ShoppingCart className="h-12 w-12" />
            <p className="text-sm">还没有点菜，去逛逛菜单吧</p>
            <Link href="/menu" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm">浏览菜单</Button>
            </Link>
            <Link href="/order/history" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="gap-1 text-gray-400">
                <Clock className="h-4 w-4" />
                点单记录
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3 mt-4">
              {items.map((item) => (
                <div
                  key={item.dishId}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                >
                  <Link
                    href={`/menu/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="w-12 h-12 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-5 w-5 text-orange-200" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/menu/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-orange-600"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                        className="p-0.5 rounded bg-white border border-gray-200 hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                        className="p-0.5 rounded bg-white border border-gray-200 hover:bg-gray-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.dishId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  共 {totalItems} 道菜
                </span>
              </div>
              <Link href="/order" onClick={() => setOpen(false)} className="block">
                <Button className="w-full gap-2" size="lg">
                  <ShoppingCart className="h-4 w-4" />
                  去下单
                </Button>
              </Link>
              <Link href="/order/history" onClick={() => setOpen(false)} className="block mt-2">
                <Button variant="ghost" size="sm" className="w-full gap-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  点单记录
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
