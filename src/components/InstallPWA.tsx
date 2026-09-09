"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const { language, t } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsInstalled(standalone || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)));
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isInstalled) return null;

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    if (isIOS) {
      window.alert(language === "th"
        ? "เปิดเมนู Share แล้วเลือก Add to Home Screen เพื่อเพิ่ม FlashcardMe ลงหน้าจอหลัก"
        : "Open Share and choose Add to Home Screen to add FlashcardMe.");
    }
  };

  if (!installPrompt && !isIOS) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#15131d] via-[#201727] to-[#13151f] px-4 py-3 text-left text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300/60 hover:shadow-[0_16px_36px_rgba(13,148,136,0.2)] active:translate-y-0"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-400/10 via-transparent to-fuchsia-400/10 opacity-70" />
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-inner">
        <img src="/flashcardme-logo.jpg" alt="" className="h-full w-full object-contain" />
      </span>
      <span className="relative flex-1">
        <span className="block text-sm font-extrabold tracking-tight">{isIOS ? t("addToHome") : t("install")}</span>
        <span className="mt-0.5 block text-[11px] font-medium text-white/55">{language === "th" ? "เปิดจากหน้าจอหลักได้เหมือนแอป" : "Open it from your home screen like an app"}</span>
      </span>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-teal-200 transition-colors group-hover:bg-teal-300/15">
        {isIOS ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      </span>
    </button>
  );
}
