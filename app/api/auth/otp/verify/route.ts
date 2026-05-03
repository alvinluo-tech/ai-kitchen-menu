import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

    const { data: profile } = await supabase
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
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "验证失败，请稍后再试" },
      { status: 500 }
    );
  }
}
