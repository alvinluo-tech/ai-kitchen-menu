"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("请检查你的邮箱，点击登录链接完成登录。");
    } catch {
      setError("登录失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
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
              此页面仅限上传和管理菜品的厨师登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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

              {message && (
                <p className="text-sm text-green-600">{message}</p>
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
                    发送登录链接
                  </>
                )}
              </Button>
            </form>

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
