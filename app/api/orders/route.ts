import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      dish_id: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  customer_note: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "无效的点单数据", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, customer_note } = parsed.data;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ customer_note: customer_note ?? null, status: "pending" })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      dish_id: item.dish_id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      // Clean up the order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "创建订单菜品失败" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "下单失败" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "chef") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          dish_id,
          quantity,
          dishes (
            id,
            name,
            slug,
            image_url,
            description
          )
        ),
        accepted_by_profile:profiles!orders_accepted_by_fkey (
          id,
          display_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch orders:", error);
      return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
    }

    return NextResponse.json({ orders: orders ?? [] });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
  }
}
