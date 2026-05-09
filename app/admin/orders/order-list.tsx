"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChefHat, Clock, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDishImageUrl } from "@/lib/dishes/types";
import type { Order } from "@/lib/orders/types";

const statusLabels: Record<string, string> = {
  pending: "待接单",
  accepted: "已接单",
  completed: "已完成",
  cancelled: "已取消",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAction = async (orderId: string, action: "accept" | "complete" | "cancel") => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "操作失败");
        return;
      }

      await fetchOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-md">
        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">暂无订单</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(order.created_at).toLocaleString("zh-CN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => handleAction(order.id, "accept")}
                  disabled={actionLoading === order.id}
                  className="gap-1"
                >
                  {actionLoading === order.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  接单
                </Button>
              )}
              {order.status === "accepted" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(order.id, "complete")}
                    disabled={actionLoading === order.id}
                    className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    完成
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction(order.id, "cancel")}
                    disabled={actionLoading === order.id}
                    className="gap-1 text-gray-400"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    取消
                  </Button>
                </>
              )}
            </div>
          </div>

          {order.customer_note && (
            <div className="px-4 py-2 bg-orange-50 text-sm text-orange-700">
              备注：{order.customer_note}
            </div>
          )}

          <div className="p-4">
            <div className="space-y-2">
              {order.order_items?.map((item) => {
                const dish = item.dishes;
                const imageUrl = getDishImageUrl(dish?.image_url);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={dish?.name || ""}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-4 w-4 text-orange-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {dish?.slug ? (
                        <Link
                          href={`/menu/${dish.slug}`}
                          className="text-sm font-medium hover:text-orange-600 line-clamp-1"
                        >
                          {dish.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-400">已删除菜品</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      x{item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {order.accepted_by_profile && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-200 flex-shrink-0">
                {order.accepted_by_profile.avatar_url ? (
                  <Image
                    src={order.accepted_by_profile.avatar_url}
                    alt=""
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ChefHat className="h-3.5 w-3.5 text-blue-400 m-auto mt-1" />
                )}
              </div>
              <span className="text-sm text-blue-700">
                已由 <span className="font-medium">{order.accepted_by_profile.display_name || "匿名厨师"}</span> 接单
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
