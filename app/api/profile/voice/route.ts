import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const VoiceSettingsSchema = z.object({
  voice_clone_enabled: z.boolean(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const { data, error } = await supabase
      .from("profiles")
      .select("voice_clone_enabled, audio_sample")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        voice_clone_enabled: data.voice_clone_enabled || false,
        has_audio_sample: !!data.audio_sample,
      },
    });
  } catch (error) {
    console.error("Failed to fetch voice settings:", error);
    return NextResponse.json(
      { error: "获取声音设置失败" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const body = await request.json();
    const parsed = VoiceSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请求参数无效", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { voice_clone_enabled } = parsed.data;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        voice_clone_enabled,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update voice settings:", error);
    return NextResponse.json(
      { error: "更新声音设置失败" },
      { status: 500 }
    );
  }
}
