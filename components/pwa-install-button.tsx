"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 检测是否已安装为 PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // 检测 iOS
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iosCheck);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // 已安装则不显示
  if (isStandalone) {
    return null;
  }

  // Android/Chrome 需要 beforeinstallprompt 触发才显示
  if (!isIOS && !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className="gap-1 text-gray-500"
      >
        <Download className="h-4 w-4" />
        <span className="text-xs">安装</span>
      </Button>

      <Dialog open={showIOSGuide} onOpenChange={setShowIOSGuide}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-orange-500" />
              添加到主屏幕
            </DialogTitle>
            <DialogDescription>
              iPhone 用户请按以下步骤操作：
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>点击 Safari 底部的<strong>分享按钮</strong></li>
              <li>向下滑动找到<strong>「添加到主屏幕」</strong></li>
              <li>点击右上角的<strong>「添加」</strong></li>
            </ol>

            <p className="text-xs text-gray-500">
              添加后，你可以像使用 App 一样从主屏幕打开本应用。
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
