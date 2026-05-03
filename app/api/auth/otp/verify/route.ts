import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const RequestSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, "验证码必须是 6 位"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请输入有效的邮箱和 6 位验证码" },
        { status: 400 }
      );
    }

    const { email, token } = parsed.data;
    const supabase = await createClient();

    // 验证 OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "登录失败" }, { status: 401 });
    }

    // 检查是否是 chef
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "chef") {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "无权限访问" }, { status: 403 });
    }

    return NextResponse.json({
      message: "登录成功",
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "验证失败，请稍后再试" },
      { status: 500 }
    );
  }
}
