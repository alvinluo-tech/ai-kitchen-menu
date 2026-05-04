/**
 * 小米 MiMo TTS 语音合成服务
 *
 * 基于官方文档: https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5
 *
 * API 端点: {baseURL}/chat/completions
 * 响应格式: message.audio.data (base64 编码的音频)
 *
 * 模型:
 * - mimo-v2.5-tts: 内置声音
 * - mimo-v2.5-tts-voiceclone: 声音克隆（传入音频样本 base64）
 */

export type VoiceMode = "default" | "chef_clone";

export type TTSConfig = {
  baseURL: string;
  apiKey: string;
  ttsModel: string;
  voiceCloneModel: string;
  defaultVoiceId: string;
};

// 内置声音列表
export const BUILTIN_VOICES = {
  mimo_default: "MiMo-默认",
  "冰糖": "冰糖",
  "茉莉": "茉莉",
  "苏打": "苏打",
  "白桦": "白桦",
  Mia: "Mia",
  Chloe: "Chloe",
  Milo: "Milo",
  Dean: "Dean",
} as const;

let cachedConfig: TTSConfig | null = null;

function getConfig(): TTSConfig {
  if (!cachedConfig) {
    const baseURL = process.env.XIAOMI_MIMO_BASE_URL;
    const apiKey = process.env.XIAOMI_MIMO_API_KEY;
    const ttsModel = process.env.XIAOMI_MIMO_TTS_MODEL || "mimo-v2.5-tts";
    const voiceCloneModel =
      process.env.XIAOMI_MIMO_VOICE_CLONE_MODEL || "mimo-v2.5-tts-voiceclone";
    const defaultVoiceId =
      process.env.XIAOMI_MIMO_DEFAULT_VOICE_ID || "mimo_default";

    if (!baseURL) {
      throw new Error("缺少 XIAOMI_MIMO_BASE_URL 环境变量");
    }
    if (!apiKey) {
      throw new Error("缺少 XIAOMI_MIMO_API_KEY 环境变量");
    }

    cachedConfig = {
      baseURL,
      apiKey,
      ttsModel,
      voiceCloneModel,
      defaultVoiceId,
    };
  }
  return cachedConfig;
}

type ChatCompletionResponse = {
  choices: Array<{
    message: {
      audio?: {
        data: string; // base64 编码的音频
      };
    };
  }>;
};

/**
 * 调用 MiMo TTS API 生成语音
 *
 * API 格式: POST {baseURL}/chat/completions
 * 请求体遵循 OpenAI chat completions 格式，带 audio 参数
 */
async function callMiMoTTS(options: {
  model: string;
  text: string;
  userMessage?: string;
  voice?: string;
  audioBase64?: string;
  format?: "mp3" | "wav" | "pcm16";
}): Promise<{ audioBase64: string; format: string }> {
  const config = getConfig();
  const {
    model,
    text,
    userMessage = "",
    voice,
    audioBase64,
    format = "mp3",
  } = options;

  console.log("[MiMo TTS] Calling:", { model, textLength: text.length, hasVoice: !!voice, hasAudioBase64: !!audioBase64 });

  // 构建 voice 参数
  let voiceParam: string | undefined;
  if (audioBase64) {
    voiceParam = audioBase64.startsWith("data:")
      ? audioBase64
      : `data:audio/mpeg;base64,${audioBase64}`;
    console.log("[MiMo TTS] Voice param length:", voiceParam.length);
  } else if (voice) {
    voiceParam = voice;
  }

  const requestBody = {
    model,
    messages: [
      { role: "user", content: userMessage },
      { role: "assistant", content: text },
    ],
    audio: {
      format,
      ...(voiceParam ? { voice: voiceParam } : {}),
    },
  };

  console.log("[MiMo TTS] URL:", `${config.baseURL}/chat/completions`);

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  console.log("[MiMo TTS] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "无法读取错误信息");
    console.error("[MiMo TTS] Error:", errorText);
    throw new Error(`MiMo TTS API 调用失败 (${response.status}): ${errorText}`);
  }

  const result: ChatCompletionResponse = await response.json();
  console.log("[MiMo TTS] Result keys:", Object.keys(result));
  console.log("[MiMo TTS] Choices:", result.choices?.length);

  const audioData = result.choices?.[0]?.message?.audio?.data;
  if (!audioData) {
    console.error("[MiMo TTS] No audio data in response:", JSON.stringify(result).substring(0, 500));
    throw new Error("MiMo TTS API 未返回音频数据");
  }

  console.log("[MiMo TTS] Audio data length:", audioData.length);
  return { audioBase64: audioData, format };
}

/**
 * 使用默认声音生成语音
 */
export async function generateDefaultVoiceSpeech(
  text: string,
  options?: {
    voice?: string;
    userMessage?: string;
  }
): Promise<{ audioBuffer: Buffer; model: string; voiceId: string; format: string }> {
  const config = getConfig();

  const { audioBase64, format } = await callMiMoTTS({
    model: config.ttsModel,
    text,
    userMessage: options?.userMessage || "",
    voice: options?.voice || config.defaultVoiceId,
  });

  const audioBuffer = Buffer.from(audioBase64, "base64");

  return {
    audioBuffer,
    model: config.ttsModel,
    voiceId: options?.voice || config.defaultVoiceId,
    format,
  };
}

/**
 * 使用厨师克隆声音生成语音
 *
 * audioBase64 是厨师声音样本的 base64 编码（带 MIME 前缀）
 */
export async function generateChefCloneSpeech(
  text: string,
  audioSampleBase64: string,
  options?: {
    userMessage?: string;
  }
): Promise<{ audioBuffer: Buffer; model: string; format: string }> {
  const config = getConfig();

  if (!audioSampleBase64) {
    throw new Error("厨师声音样本数据为空");
  }

  const { audioBase64, format } = await callMiMoTTS({
    model: config.voiceCloneModel,
    text,
    userMessage: options?.userMessage || "",
    audioBase64: audioSampleBase64,
  });

  const audioBuffer = Buffer.from(audioBase64, "base64");

  return {
    audioBuffer,
    model: config.voiceCloneModel,
    format,
  };
}
