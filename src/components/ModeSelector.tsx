"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardCategory, Flashcard } from "@/types/flashcard";
import { ShieldCheck, BookOpenCheck, ChevronRight } from "lucide-react";
import { InstallPWA } from "@/components/InstallPWA";
import { useLanguage } from "@/lib/language";

interface ModeSelectorProps {
  cards: Flashcard[];
  onSelectMode: (mode: CardCategory) => void;
  onOpenAddModal: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  cards,
  onSelectMode,
  onOpenAddModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="min-h-[100svh] w-full bg-[#050507] text-white flex flex-col justify-between px-5 py-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,calc(2.5rem+env(safe-area-inset-bottom)))] sm:px-8 sm:py-16 lg:max-w-3xl lg:px-20 mx-auto relative overflow-hidden font-sans select-none">
      {/* Subtle Dynamic Ambient Backlight (Apple / Arc style) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-amber-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Status Pill - Ultra Clean Mobile Header */}
      <div className="w-full flex items-center justify-between z-10 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide text-neutral-300">{t("spacedRepetition")}</span>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-0.5" aria-label="Language selector">
          {(["th", "en"] as const).map((option) => (
            <button key={option} type="button" onClick={() => setLanguage(option)} className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${language === option ? "bg-white text-slate-900" : "text-neutral-500"}`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Hero / Brand Center Section */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-10 z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          {/* Subtle Outer Neon Halo */}
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-amber-500/25 via-rose-500/25 to-indigo-500/35 blur-xl opacity-70 transition duration-700 hover:opacity-100" />

          <div className="relative h-[150px] w-[280px] flex items-center justify-center sm:h-[190px] sm:w-[360px]">
            <img src="/flashcardme-logo-mainpage-Photoroom.png" alt="FlashcardMe logo" className="h-full w-full object-contain" />
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs text-neutral-400 font-normal tracking-wide mt-2">
            ทบทวนคำศัพท์และเตรียมสอบอย่างแม่นยำ
          </p>
        </motion.div>
      </div>

      {/* Action / Selection Section - Ultra-Refined iOS/Linear Card Buttons */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.55 }}
        className="w-full space-y-3 z-10 pb-4"
      >
        {/* Button 1: Personal deck */}
        <button
          onClick={() => onSelectMode("cert")}
          className="w-full group relative overflow-hidden rounded-2xl p-4 text-left border border-purple-500/20 bg-gradient-to-b from-[#14121d] to-[#0f0e16] hover:border-purple-400/40 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-purple-950/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/25 group-hover:scale-105 transition-all duration-200">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[15px] text-white tracking-tight">
                    {t("privateDeck")}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">{t("personal")}</span>
                </div>
                <div className="text-xs text-neutral-400 font-normal mt-0.5">{t("managePersonalCards")}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Button 2: General Vocab */}
        <button
          onClick={() => onSelectMode("general")}
          className="w-full group relative overflow-hidden rounded-2xl p-4 text-left border border-white/[0.08] bg-[#0e0e13] hover:bg-[#13131a] hover:border-white/20 active:scale-[0.98] transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all duration-200">
                <BookOpenCheck className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="font-semibold text-[15px] text-white tracking-tight">
                  {t("generalVocabulary")}
                </div>
                <div className="text-xs text-neutral-400 font-normal mt-0.5">{t("generalEnglish")}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        <div className="pt-2">
          <InstallPWA />
        </div>
      </motion.div>
    </div>
  );
};
