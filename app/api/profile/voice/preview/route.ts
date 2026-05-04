import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { generateChefCloneSpeech } from "@/lib/ai/mimo-tts";

const PREVIEW_TEXT = "你好，这是一段试听音频。我是这道菜的厨师，很高兴能用我的声音为你介绍今天的菜品。希望你会喜欢！";

export async function POST() {
  try {
    console.log("[Preview] Start");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[Preview] Not logged in");
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "chef") {
      console.log("[Preview] Not a chef");
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 获取声音样本
    const { data: fullProfile } = await supabase
      .from("profiles")
      .select("audio_sample")
      .eq("id", user.id)
      .single();

    console.log("[Preview] Has audio_sample:", !!fullProfile?.audio_sample);

    if (!fullProfile?.audio_sample) {
      return NextResponse.json({ error: "请先上传声音样本" }, { status: 400 });
    }

    // 下载音频并转为 base64
    const audioUrl = fullProfile.audio_sample;
    let audioSampleBase64: string;

    if (audioUrl.startsWith("http")) {
      console.log("[Preview] Downloading audio:", audioUrl.substring(0, 50));
      const response = await fetch(audioUrl);
      if (!response.ok) {
        console.error("[Preview] Download failed:", response.status);
        return NextResponse.json({ error: "下载声音样本失败" }, { status: 500 });
      }
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const ext = audioUrl.split(".").pop()?.toLowerCase() || "mp3";
      const mime = ext === "wav" ? "audio/wav" : "audio/mpeg";
      audioSampleBase64 = `data:${mime};base64,${base64}`;
      console.log("[Preview] Audio base64 length:", base64.length);
    } else {
      audioSampleBase64 = audioUrl;
    }

    // 用克隆声音生成试听音频
    console.log("[Preview] Generating clone speech...");
    const { audioBuffer, format } = await generateChefCloneSpeech(
      PREVIEW_TEXT,
      audioSampleBase64
    );
    console.log("[Preview] Generated audio size:", audioBuffer.length, "format:", format);

    // 上传到 Storage
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const mimeType = format === "wav" ? "audio/wav" : "audio/mpeg";
    const ext = format === "wav" ? "wav" : "mp3";

    const fileName = `preview-${user.id}-${Date.now()}.${ext}`;
    const filePath = `voice-previews/${fileName}`;

    const { error: uploadError } = await serviceSupabase.storage
      .from("voice-samples")
      .upload(filePath, audioBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Preview] Upload error:", uploadError);
      return NextResponse.json({ error: "保存试听音频失败" }, { status: 500 });
    }

    const { data: urlData } = serviceSupabase.storage
      .from("voice-samples")
      .getPublicUrl(filePath);

    console.log("[Preview] Done:", urlData.publicUrl);
    return NextResponse.json({
      success: true,
      audioUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("[Preview] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "试听生成失败" },
      { status: 500 }
    );
  }
}
