import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  generateDefaultVoiceSpeech,
  generateChefCloneSpeech,
  type VoiceMode,
} from "@/lib/ai/mimo-tts";
import type { Dish } from "@/lib/dishes/types";

type DishWithDetails = Dish & {
  dish_ingredients?: {
    id: string;
    amount?: string | null;
    is_required: boolean;
    ingredients: { id: string; name: string; category?: string | null };
  }[];
  dish_tags?: { id: string; tag: string }[];
  profiles?: { id: string; display_name: string | null; avatar_url: string | null } | null;
};

type SpeechResult = {
  audioUrl: string;
  voiceMode: VoiceMode;
  model: string;
  generatedText: string;
  cached: boolean;
  fallbackUsed: boolean;
};

/**
 * 基于真实菜品数据构建播报文案
 */
export function buildDishSpeechText(dish: DishWithDetails): string {
  const parts: string[] = [];

  parts.push(`${dish.name}，${dish.description}`);

  if (dish.story) {
    parts.push(dish.story);
  }

  if (dish.dish_ingredients && dish.dish_ingredients.length > 0) {
    const ingredientNames = dish.dish_ingredients
      .slice(0, 6)
      .map((item) => {
        const name = item.ingredients.name;
        return item.amount ? `${name}${item.amount}` : name;
      })
      .join("、");
    parts.push(`主要食材包括${ingredientNames}`);
  }

  if (dish.dish_tags && dish.dish_tags.length > 0) {
    const tags = dish.dish_tags.map((t) => t.tag).join("、");
    parts.push(`风味标签：${tags}`);
  }

  if (dish.spice_level > 0) {
    const spiceDesc =
      dish.spice_level <= 1
        ? "微微辣"
        : dish.spice_level <= 2
          ? "微辣"
          : dish.spice_level <= 3
            ? "中辣"
            : dish.spice_level <= 4
              ? "辣"
              : "很辣";
    parts.push(`辣度${spiceDesc}`);
  }

  if (dish.cooking_time_minutes) {
    parts.push(`烹饪时间大约${dish.cooking_time_minutes}分钟`);
  }

  if (dish.servings) {
    parts.push(`适合${dish.servings}人食用`);
  }

  parts.push("欢迎品尝。");

  return parts.join("。") + "。";
}

function computeTextHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function findCachedAudio(
  dishId: string,
  voiceMode: VoiceMode,
  voiceId: string | null,
  textHash: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("speech_audio_cache")
    .select("audio_url")
    .eq("dish_id", dishId)
    .eq("voice_mode", voiceMode)
    .eq("voice_id", voiceId)
    .eq("text_hash", textHash)
    .single();

  return data?.audio_url || null;
}

async function saveAudioCache(
  dishId: string,
  voiceMode: VoiceMode,
  voiceId: string | null,
  generatedText: string,
  textHash: string,
  audioUrl: string,
  model: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("speech_audio_cache").insert({
    dish_id: dishId,
    voice_mode: voiceMode,
    voice_id: voiceId,
    generated_text: generatedText,
    text_hash: textHash,
    audio_url: audioUrl,
    model,
  });
}

async function uploadAudioToStorage(
  audioBuffer: Buffer,
  dishId: string,
  voiceMode: string,
  format: string = "mp3"
): Promise<string> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const mimeType = format === "wav" ? "audio/wav" : "audio/mpeg";
  const ext = format === "wav" ? "wav" : "mp3";

  const timestamp = Date.now();
  const filePath = `dish-speech/${dishId}/${voiceMode}-${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from("voice-samples")
    .upload(filePath, audioBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`音频上传失败: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("voice-samples")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * 生成菜品语音播报
 */
export async function generateDishSpeech(
  dishId: string,
  voiceMode: VoiceMode = "default",
  options?: {
    forceRegenerate?: boolean;
  }
): Promise<SpeechResult> {
  console.log("[DishSpeech] Start:", { dishId, voiceMode, options });
  const supabase = await createClient();

  // 1. 获取菜品数据
  const { data: dish, error: dishError } = await supabase
    .from("dishes")
    .select(
      `
      *,
      dish_ingredients (
        id, amount, is_required,
        ingredients (id, name, category)
      ),
      dish_tags (id, tag),
      profiles!created_by (id, display_name, avatar_url)
      `
    )
    .eq("id", dishId)
    .single();

  if (dishError || !dish) {
    console.error("[DishSpeech] Dish not found:", dishError);
    throw new Error("菜品不存在");
  }

  console.log("[DishSpeech] Dish found:", dish.name, "chef:", dish.profiles?.display_name);

  // 2. 构建播报文案
  const generatedText = buildDishSpeechText(dish as DishWithDetails);
  const textHash = computeTextHash(generatedText);
  console.log("[DishSpeech] Text generated, hash:", textHash);

  // 3. 检查缓存
  let actualMode = voiceMode;
  let fallbackUsed = false;
  let audioSampleBase64: string | null = null;

  // 4. 如果是 chef_clone 模式，获取厨师声音样本
  if (voiceMode === "chef_clone") {
    const chefProfile = (dish as DishWithDetails).profiles;
    if (!chefProfile) {
      console.log("[DishSpeech] No chef profile, fallback to default");
      actualMode = "default";
      fallbackUsed = true;
    } else {
      const { data: fullProfile } = await supabase
        .from("profiles")
        .select("voice_clone_enabled, audio_sample")
        .eq("id", chefProfile.id)
        .single();

      console.log("[DishSpeech] Chef profile:", {
        voice_clone_enabled: fullProfile?.voice_clone_enabled,
        has_audio_sample: !!fullProfile?.audio_sample,
      });

      if (!fullProfile || !fullProfile.voice_clone_enabled || !fullProfile.audio_sample) {
        console.log("[DishSpeech] Chef voice not configured, fallback to default");
        actualMode = "default";
        fallbackUsed = true;
      } else {
        // 下载音频并转为 base64
        const audioUrl = fullProfile.audio_sample;
        if (audioUrl.startsWith("http")) {
          console.log("[DishSpeech] Downloading audio sample...");
          const response = await fetch(audioUrl);
          if (!response.ok) {
            console.error("[DishSpeech] Failed to download audio:", response.status);
            actualMode = "default";
            fallbackUsed = true;
          } else {
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const ext = audioUrl.split(".").pop()?.toLowerCase() || "mp3";
            const mime = ext === "wav" ? "audio/x-wav" : "audio/mpeg";
            audioSampleBase64 = `data:${mime};base64,${base64}`;
            console.log("[DishSpeech] Audio sample ready, size:", base64.length);
          }
        } else {
          audioSampleBase64 = audioUrl;
        }
      }
    }
  }

  console.log("[DishSpeech] Actual mode:", actualMode);

  // 5. 计算缓存 key
  // voice_id = chef_id + 声音样本 hash（确保声音样本更新后缓存失效）
  let cacheVoiceId: string | null = null;
  if (actualMode === "chef_clone") {
    const chefId = (dish as DishWithDetails).profiles?.id || "unknown";
    // 用声音样本 URL 的 hash 作为标识
    const chefProfile = (dish as DishWithDetails).profiles;
    if (chefProfile) {
      const { data: fullProfile } = await supabase
        .from("profiles")
        .select("audio_sample")
        .eq("id", chefProfile.id)
        .single();
      const sampleUrl = fullProfile?.audio_sample || "";
      const sampleHash = computeTextHash(sampleUrl);
      cacheVoiceId = `${chefId}_${sampleHash}`;
    } else {
      cacheVoiceId = chefId;
    }
    console.log("[DishSpeech] Cache voice ID:", cacheVoiceId);
  }

  // 6. 检查缓存
  if (!options?.forceRegenerate) {
    const cachedUrl = await findCachedAudio(
      dishId,
      actualMode,
      cacheVoiceId,
      textHash
    );
    if (cachedUrl) {
      console.log("[DishSpeech] Cache hit:", cachedUrl);
      return {
        audioUrl: cachedUrl,
        voiceMode: actualMode,
        model: actualMode === "chef_clone" ? "mimo-v2.5-tts-voiceclone" : "mimo-v2.5-tts",
        generatedText,
        cached: true,
        fallbackUsed,
      };
    }
    console.log("[DishSpeech] Cache miss");
  }

  // 7. 生成语音
  console.log("[DishSpeech] Generating speech...");
  let audioResult;

  try {
    if (actualMode === "chef_clone" && audioSampleBase64) {
      audioResult = await generateChefCloneSpeech(generatedText, audioSampleBase64);
    } else {
      audioResult = await generateDefaultVoiceSpeech(generatedText);
    }
  } catch (error) {
    // chef_clone 失败时回退到 default
    if (actualMode === "chef_clone" && !fallbackUsed) {
      try {
        audioResult = await generateDefaultVoiceSpeech(generatedText);
        actualMode = "default";
        cacheVoiceId = null;
        fallbackUsed = true;
      } catch {
        throw new Error(
          `语音生成失败: ${error instanceof Error ? error.message : "未知错误"}`
        );
      }
    } else {
      throw error;
    }
  }

  // 8. 上传音频到存储
  const audioUrl = await uploadAudioToStorage(
    audioResult.audioBuffer,
    dishId,
    actualMode,
    audioResult.format
  );

  // 9. 保存缓存
  await saveAudioCache(
    dishId,
    actualMode,
    cacheVoiceId,
    generatedText,
    textHash,
    audioUrl,
    audioResult.model
  );

  return {
    audioUrl,
    voiceMode: actualMode,
    model: audioResult.model,
    generatedText,
    cached: false,
    fallbackUsed,
  };
}
