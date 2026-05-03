"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Mail, ChefHat, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "发送失败");
        return;
      }

      setStep("otp");
      setSuccess("验证码已发送，请查收邮箱");
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("发送失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (token: string) => {
    setVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "验证失败");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        return;
      }

      setSuccess("登录成功，正在跳转...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 500);
    } catch {
      setError("验证失败，请稍后再试");
    } finally {
      setVerifying(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">厨师登录</CardTitle>
            <CardDescription>
              {step === "email"
                ? "输入邮箱获取验证码"
                : `验证码已发送至 ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      发送验证码
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-mono"
                      disabled={verifying}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                {success && (
                  <p className="text-sm text-green-600 text-center">{success}</p>
                )}

                {verifying && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    验证中...
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleBack}
                    disabled={verifying}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    使用其他邮箱
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-sm text-gray-500"
                    onClick={handleSendOtp}
                    disabled={loading || countdown > 0 || verifying}
                  >
                    {countdown > 0
                      ? `${countdown} 秒后可重发`
                      : "重新发送验证码"}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                普通用户无需登录，可直接浏览菜单和使用 AI 推荐
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
