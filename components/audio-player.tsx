"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// 全局音频单例：确保同一时间只有一段音频播放
let globalAudio: HTMLAudioElement | null = null;
let globalStopCallback: (() => void) | null = null;

function stopCurrentAudio() {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio = null;
  }
  if (globalStopCallback) {
    globalStopCallback();
    globalStopCallback = null;
  }
}

type AudioPlayerProps = {
  dishId: string;
  chefHasVoice?: boolean;
  className?: string;
};

export function AudioPlayer({ dishId, chefHasVoice = false, className }: AudioPlayerProps) {
  const [state, setState] = useState<
    "idle" | "loading" | "playing" | "paused" | "error"
  >("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 组件卸载时停止音频
  useEffect(() => {
    return () => {
      if (audioRef.current === globalAudio) {
        stopCurrentAudio();
      }
    };
  }, []);

  const generateAudio = useCallback(
    async (forceRegenerate = false) => {
      // 停止当前播放的音频
      stopCurrentAudio();

      setState("loading");
      setErrorMessage(null);
      setFallbackNotice(null);

      try {
        const voiceMode = chefHasVoice ? "chef_clone" : "default";
        console.log("[AudioPlayer] Generating audio:", { dishId, voiceMode, chefHasVoice });

        const response = await fetch(`/api/dishes/${dishId}/speech`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voiceMode,
            forceRegenerate,
          }),
        });

        console.log("[AudioPlayer] Response status:", response.status);
        const data = await response.json();
        console.log("[AudioPlayer] Response data:", data);

        if (!response.ok) {
          throw new Error(data.error || "语音生成失败");
        }

        if (data.fallbackUsed) {
          setFallbackNotice("厨师声音暂不可用，已切换为默认声音播报。");
        }

        setAudioUrl(data.audioUrl);

        // 创建并播放音频
        const audio = new Audio();
        audio.preload = "auto";
        audioRef.current = audio;

        // 注册为当前播放的音频
        globalAudio = audio;
        globalStopCallback = () => {
          setState("idle");
        };

        audio.onended = () => {
          console.log("[AudioPlayer] Audio ended");
          setState("idle");
          if (globalAudio === audio) {
            globalAudio = null;
            globalStopCallback = null;
          }
        };
        audio.onerror = (e) => {
          console.error("[AudioPlayer] Audio error:", e);
          setState("error");
          setErrorMessage("音频播放失败");
          if (globalAudio === audio) {
            globalAudio = null;
            globalStopCallback = null;
          }
        };

        // 等待音频加载完成后播放
        await new Promise<void>((resolve, reject) => {
          audio.oncanplay = () => resolve();
          audio.onerror = () => reject(new Error("音频加载失败"));
          audio.src = data.audioUrl;
          audio.load();
        });

        setState("playing");
        console.log("[AudioPlayer] Playing audio...");
        await audio.play();
        console.log("[AudioPlayer] Audio playing");
      } catch (error) {
        console.error("[AudioPlayer] Generate error:", error);
        setState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "语音生成失败"
        );
      }
    },
    [dishId, chefHasVoice]
  );

  const togglePlayPause = useCallback(() => {
    if (state === "playing" && audioRef.current) {
      audioRef.current.pause();
      setState("paused");
    } else if (state === "paused" && audioRef.current) {
      // 恢复播放前先停止其他音频
      stopCurrentAudio();
      globalAudio = audioRef.current;
      globalStopCallback = () => {
        setState("idle");
      };
      audioRef.current.play();
      setState("playing");
    } else {
      generateAudio();
    }
  }, [state, generateAudio]);

  const handleReplay = useCallback(() => {
    if (audioRef.current && audioUrl) {
      stopCurrentAudio();
      globalAudio = audioRef.current;
      globalStopCallback = () => {
        setState("idle");
      };
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setState("playing");
    } else {
      generateAudio(true);
    }
  }, [audioUrl, generateAudio]);

  return (
    <div className={className}>
      {fallbackNotice && (
        <p className="text-xs text-amber-600 mb-2">{fallbackNotice}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          disabled={state === "loading"}
          className="gap-1.5"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state === "playing" ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>
            {state === "loading"
              ? "生成中..."
              : state === "playing"
                ? "暂停"
                : state === "paused"
                  ? "继续播放"
                  : chefHasVoice
                    ? "听厨师介绍"
                    : "播放介绍"}
          </span>
        </Button>

        {(state === "playing" || state === "paused") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReplay}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        {state === "idle" && audioUrl && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReplay}
            className="h-8 w-8"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
