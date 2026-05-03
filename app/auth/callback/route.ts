import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth callback error:", error);
  }

  // 如果没有 code 或者交换失败，检查是否已有 session
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // 最终回退到首页
  return NextResponse.redirect(`${origin}/`);
}
