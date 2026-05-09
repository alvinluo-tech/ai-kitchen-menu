import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateOrderSchema = z.object({
  action: z.enum(["accept", "complete", "cancel"]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "chef") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = UpdateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "无效的请求" },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    if (action === "accept") {
      // Check if order is still pending
      const { data: order } = await supabase
        .from("orders")
        .select("status, accepted_by")
        .eq("id", id)
        .single();

      if (!order) {
        return NextResponse.json({ error: "订单不存在" }, { status: 404 });
      }

      if (order.status !== "pending") {
        return NextResponse.json(
          { error: order.accepted_by ? "该订单已被其他厨师接单" : "该订单状态不是待接单" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("orders")
        .update({
          status: "accepted",
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Failed to accept order:", error);
        return NextResponse.json({ error: "接单失败" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "complete") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", id)
        .eq("accepted_by", user.id);

      if (error) {
        console.error("Failed to complete order:", error);
        return NextResponse.json({ error: "完成订单失败" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "cancel") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) {
        console.error("Failed to cancel order:", error);
        return NextResponse.json({ error: "取消订单失败" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
  }
}
