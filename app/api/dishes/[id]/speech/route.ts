import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDishSpeech } from "@/lib/services/dish-speech";

const SpeechRequestSchema = z.object({
  voiceMode: z.enum(["default", "chef_clone"]).default("default"),
  forceRegenerate: z.boolean().default(false),
});

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("[Speech API] Request:", { id, body });

    const parsed = SpeechRequestSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[Speech API] Invalid params:", parsed.error);
      return NextResponse.json(
        { error: "请求参数无效", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { voiceMode, forceRegenerate } = parsed.data;
    console.log("[Speech API] Parsed:", { voiceMode, forceRegenerate });

    const result = await generateDishSpeech(id, voiceMode, {
      forceRegenerate,
    });

    console.log("[Speech API] Result:", {
      audioUrl: result.audioUrl?.substring(0, 50) + "...",
      voiceMode: result.voiceMode,
      model: result.model,
      cached: result.cached,
      fallbackUsed: result.fallbackUsed,
    });

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      voiceMode: result.voiceMode,
      model: result.model,
      generatedText: result.generatedText,
      cached: result.cached,
      fallbackUsed: result.fallbackUsed,
    });
  } catch (error) {
    console.error("[Speech API] Error:", error);

    const message =
      error instanceof Error ? error.message : "语音生成失败";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
