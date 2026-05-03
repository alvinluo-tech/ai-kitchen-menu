import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const xiaomi = createOpenAICompatible({
  name: "xiaomi-mimo",
  apiKey: process.env.XIAOMI_MIMO_API_KEY!,
  baseURL: process.env.XIAOMI_MIMO_BASE_URL!,
});

export const xiaomiModel = xiaomi.chatModel(
  process.env.XIAOMI_MIMO_MODEL || "mimo-v2.5"
);
