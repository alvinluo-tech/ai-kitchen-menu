import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const supabase = await createClient();

    // 检查是否是 chef 用户
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "该邮箱未注册" },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "chef") {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    // 发送 OTP（Supabase 会通过配置的 SMTP 发送）
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "验证码已发送到你的邮箱",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "发送验证码失败，请稍后再试" },
      { status: 500 }
    );
  }
}
