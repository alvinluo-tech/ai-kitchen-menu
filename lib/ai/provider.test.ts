import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the openai-compatible module
vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: vi.fn(() => ({
    chatModel: vi.fn((model: string) => ({ modelId: model })),
  })),
}));

// Must reset the module between tests to clear the singleton cache
beforeEach(() => {
  vi.resetModules();
});

describe("AI Provider", () => {
  it("getModelName returns configured model", async () => {
    const { getModelName } = await import("./provider");
    const name = getModelName();
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });

  it("getProviderName returns configured provider name", async () => {
    const { getProviderName } = await import("./provider");
    const name = getProviderName();
    expect(name).toBe("xiaomi-mimo");
  });

  it("getAIProvider returns provider with name and model", async () => {
    const { getAIProvider } = await import("./provider");
    const provider = getAIProvider();
    expect(provider.name).toBe("xiaomi-mimo");
    expect(provider.model).toBeDefined();
  });

  it("getAIProvider returns same instance on multiple calls (singleton)", async () => {
    const { getAIProvider } = await import("./provider");
    const p1 = getAIProvider();
    const p2 = getAIProvider();
    expect(p1).toBe(p2);
  });
});
