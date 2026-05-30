import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_EMAIL_FROM = "test@example.com";
});

describe("sendOtpEmail", () => {
  it("sends email successfully", async () => {
    mockSend.mockResolvedValue({ data: { id: "msg-1" }, error: null });

    const { sendOtpEmail } = await import("./email");
    const result = await sendOtpEmail("user@test.com", "123456");

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: "登录验证码",
      })
    );
    expect(result).toEqual({ id: "msg-1" });
  });

  it("includes code in HTML body", async () => {
    mockSend.mockResolvedValue({ data: { id: "msg-1" }, error: null });

    const { sendOtpEmail } = await import("./email");
    await sendOtpEmail("user@test.com", "654321");

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("654321");
  });

  it("throws on error", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Send failed" },
    });

    const { sendOtpEmail } = await import("./email");
    await expect(sendOtpEmail("user@test.com", "123456")).rejects.toThrow(
      "Send failed"
    );
  });
});
