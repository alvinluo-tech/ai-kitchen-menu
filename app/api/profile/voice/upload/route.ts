import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/flac",
];

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择音频文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "只支持 MP3、WAV、M4A、OGG、FLAC 格式" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "音频文件大小不能超过 10MB" },
        { status: 400 }
      );
    }

    // 读取原始音频
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // 确定文件扩展名
    const ext = file.type === "audio/wav" || file.type === "audio/x-wav" ? "wav"
      : file.type === "audio/m4a" || file.type === "audio/mp4" ? "m4a"
      : file.type === "audio/ogg" ? "ogg"
      : file.type === "audio/flac" ? "flac"
      : "mp3";

    // 上传到 Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `voice-samples/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("voice-samples")
      .upload(filePath, audioBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Voice sample upload error:", uploadError);
      return NextResponse.json({ error: "上传失败: " + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("voice-samples")
      .getPublicUrl(filePath);

    const audioUrl = urlData.publicUrl;

    // 保存 URL 到 profiles 表
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        audio_sample: audioUrl,
        voice_clone_enabled: true,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save audio sample:", updateError);
      return NextResponse.json({ error: "保存声音样本失败: " + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      audioUrl,
    });
  } catch (error) {
    console.error("Voice upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
      { status: 500 }
    );
  }
}
