import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export type AIProviderConfig = {
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
};

export type AIProvider = {
  name: string;
  model: LanguageModel;
};

// 默认配置（小米 MiMo）
const defaultConfig: AIProviderConfig = {
  name: "xiaomi-mimo",
  baseURL: process.env.AI_BASE_URL || process.env.XIAOMI_MIMO_BASE_URL || "",
  apiKey: process.env.AI_API_KEY || process.env.XIAOMI_MIMO_API_KEY || "",
  model: process.env.AI_MODEL || process.env.XIAOMI_MIMO_MODEL || "mimo-v2.5",
};

// 创建 provider 实例
function createProvider(config: AIProviderConfig): AIProvider {
  const provider = createOpenAICompatible({
    name: config.name,
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  return {
    name: config.name,
    model: provider.chatModel(config.model),
  };
}

// 单例模式
let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = createProvider(defaultConfig);
  }
  return cachedProvider;
}

// 获取当前模型名称（用于显示）
export function getModelName(): string {
  return defaultConfig.model;
}

// 获取当前 provider 名称（用于显示）
export function getProviderName(): string {
  return defaultConfig.name;
}
