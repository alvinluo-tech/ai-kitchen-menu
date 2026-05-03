"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ImageUploader } from "@/components/image-uploader";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  years_of_cooking: number | null;
  show_on_showcase: boolean;
  social_link: string | null;
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [yearsOfCooking, setYearsOfCooking] = useState<number | "">("");
  const [showOnShowcase, setShowOnShowcase] = useState(false);
  const [socialLink, setSocialLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
        setBio(data.bio || "");
        setSpecialties(data.specialties || []);
        setYearsOfCooking(data.years_of_cooking || "");
        setShowOnShowcase(data.show_on_showcase || false);
        setSocialLink(data.social_link || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const addSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("未登录");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          bio: bio || null,
          specialties: specialties.length > 0 ? specialties : null,
          years_of_cooking: yearsOfCooking || null,
          show_on_showcase: showOnShowcase,
          social_link: socialLink || null,
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("保存成功");
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError("保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">个人资料</h1>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>头像</Label>
                  {avatarUrl ? (
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt="头像"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setAvatarUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <ImageUploader
                      onUpload={setAvatarUrl}
                      disabled={saving}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">昵称</Label>
                  <Input
                    id="display_name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="你的昵称"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="介绍一下你自己，比如你的烹饪经历、理念等"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years">烹饪年限</Label>
                  <Input
                    id="years"
                    type="number"
                    min="0"
                    value={yearsOfCooking}
                    onChange={(e) => setYearsOfCooking(e.target.value ? Number(e.target.value) : "")}
                    placeholder="例如：5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social">社交链接（可选）</Label>
                  <Input
                    id="social"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder="例如：https://weibo.com/xxx"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">擅长菜系</CardTitle>
                <CardDescription>添加你擅长的菜系或烹饪风格</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    placeholder="例如：川菜"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSpecialty}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="gap-1">
                        {specialty}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => removeSpecialty(specialty)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">展示设置</CardTitle>
                <CardDescription>控制你的信息是否在厨师风采页面展示</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="show_on_showcase"
                    checked={showOnShowcase}
                    onChange={(e) => setShowOnShowcase(e.target.checked)}
                    className="rounded w-4 h-4"
                  />
                  <Label htmlFor="show_on_showcase" className="cursor-pointer">
                    在厨师风采页面展示我的信息
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-7">
                  开启后，其他用户可以在厨师风采页面看到你的昵称、简介和擅长菜系
                </p>
              </CardContent>
            </Card>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存修改
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
