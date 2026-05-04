"use client";

import { useState, useEffect, useOptimistic, useRef } from "react";
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

    // Optimistic: snapshot current values for rollback
    const prevProfile = profile ? { ...profile } : null;

    // Optimistically update local profile state
    if (profile) {
      setProfile({
        ...profile,
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        bio: bio || null,
        specialties: specialties.length > 0 ? specialties : null,
        years_of_cooking: yearsOfCooking || null,
        show_on_showcase: showOnShowcase,
        social_link: socialLink || null,
      });
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { toast } = await import("sonner");
        toast.error("未登录");
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
        // Rollback
        if (prevProfile) setProfile(prevProfile);
        const { toast } = await import("sonner");
        toast.error(updateError.message);
        return;
      }

      const { toast } = await import("sonner");
      toast.success("保存成功");
    } catch {
      // Rollback
      if (prevProfile) setProfile(prevProfile);
      const { toast } = await import("sonner");
      toast.error("保存失败，请稍后再试");
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

            <VoiceSettingsCard />

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

function VoiceSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [hasSample, setHasSample] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/profile/voice");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setEnabled(data.settings.voice_clone_enabled || false);
            setHasSample(!!data.settings.has_audio_sample);
          }
        }
      } catch {
        // 忽略错误
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const uploadAudio = async (blob: Blob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.wav");

      const res = await fetch("/api/profile/voice/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");

      setHasSample(true);
      setRecorded(true);
      setPreviewUrl(null);

      const { toast } = await import("sonner");
      toast.success("声音样本已保存");
    } catch (error) {
      const { toast } = await import("sonner");
      toast.error(error instanceof Error ? error.message : "处理失败");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAudio(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const convertWebmToWav = async (webmBlob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 转为 WAV
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * numChannels * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // 写入音频数据
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const webmBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        // 转为 WAV 再上传
        const wavBlob = await convertWebmToWav(webmBlob);
        uploadAudio(wavBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      const { toast } = await import("sonner");
      toast.error("无法访问麦克风，请检查浏览器权限");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/voice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_clone_enabled: enabled,
        }),
      });

      if (!res.ok) throw new Error("保存失败");

      const { toast } = await import("sonner");
      toast.success("声音设置已保存");
    } catch {
      const { toast } = await import("sonner");
      toast.error("保存声音设置失败");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const res = await fetch("/api/profile/voice/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "试听失败");

      setPreviewUrl(data.audioUrl);

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(data.audioUrl);
      previewAudioRef.current = audio;
      audio.play();
    } catch (error) {
      const { toast } = await import("sonner");
      toast.error(error instanceof Error ? error.message : "试听失败");
    } finally {
      setPreviewing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">声音播报设置</CardTitle>
        <CardDescription>
          配置菜品语音播报功能，支持默认声音和厨师声音克隆
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="voice_clone_enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded w-4 h-4"
          />
          <Label htmlFor="voice_clone_enabled" className="cursor-pointer">
            启用厨师声音克隆
          </Label>
        </div>

        {enabled && (
          <>
            <div className="space-y-3">
              <Label>录制声音样本</Label>
              <div className="flex items-center gap-2">
                {!recording ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    disabled={uploading}
                    className="gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    开始录制
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    停止 ({formatTime(recordingTime)})
                  </Button>
                )}
                {uploading && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    处理中...
                  </span>
                )}
                {hasSample && !uploading && (
                  <span className="text-xs text-green-600">
                    {recorded ? "已保存" : "已有样本"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                点击录制，朗读一段文字（建议 5-15 秒）
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">或</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>上传音频文件</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.flac,audio/*"
                  onChange={handleUpload}
                  className="hidden"
                  id="voice-file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || recording}
                  className="gap-1.5"
                >
                  选择音频文件
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                支持 MP3、WAV、M4A 格式，最大 10MB
              </p>
            </div>
          </>
        )}

        {enabled && hasSample && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={previewing}
              className="gap-1.5"
            >
              {previewing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                "试听克隆声音"
              )}
            </Button>
            {previewUrl && (
              <span className="text-xs text-green-600">播放中</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Badge variant={enabled && hasSample ? "default" : "secondary"}>
            {enabled && hasSample ? "厨师克隆已启用" : "使用默认声音"}
          </Badge>
        </div>

        <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "保存声音设置"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

