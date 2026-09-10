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
    <div className="relative mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col justify-between overflow-hidden bg-[#070b14] px-5 pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom)))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white selection:bg-indigo-500/30 sm:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-400/10 blur-[90px]" />
      <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 flex w-full items-center justify-between pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium tracking-[0.14em] text-slate-200 uppercase">
            {t("spacedRepetition")}
          </span>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5 backdrop-blur-md" aria-label="Language selector">
          {(["th", "en"] as const).map((option) => (
            <button key={option} type="button" onClick={() => setLanguage(option)} className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${language === option ? "bg-white text-slate-900" : "text-slate-400 hover:text-slate-200"}`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-cyan-400/20 blur-2xl" />
          <div className="relative flex h-[150px] w-[280px] items-center justify-center sm:h-[190px] sm:w-[360px]">
            <img src="/flashcardme-logo-mainpage-Photoroom.png" alt="FlashcardMe logo" className="h-full w-full object-contain" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">
            <span className="h-2 w-2 rounded-full bg-indigo-300" />
            memory engine
          </div>
          <p className="text-base font-medium text-slate-300 sm:text-lg">
            ทบทวนคำศัพท์แบบมีจังหวะและมีเป้าหมาย
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="relative z-10 w-full space-y-3 pb-4"
      >
        <div className="grid gap-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
          <button
            onClick={() => onSelectMode("cert")}
            className="group relative w-full overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#171423] via-[#12111b] to-[#0e1018] p-4 text-left shadow-[0_20px_40px_rgba(91,33,182,0.18)] transition-all duration-200 hover:border-purple-400/40 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/15 text-purple-200 transition group-hover:scale-105 group-hover:bg-purple-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold tracking-tight text-white">
                      {t("privateDeck")}
                    </span>
                    <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-purple-200">
                      {t("personal")}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{t("managePersonalCards")}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-purple-200" />
            </div>
          </button>

          <button
            onClick={() => onSelectMode("general")}
            className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1320] via-[#0c111b] to-[#0b0f17] p-4 text-left transition-all duration-200 hover:border-blue-400/30 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-blue-200 transition group-hover:scale-105 group-hover:bg-blue-500/15">
                  <BookOpenCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold tracking-tight text-white">
                    {t("generalVocabulary")}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{t("generalEnglish")}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-blue-200" />
            </div>
          </button>
        </div>

        <div className="pt-2">
          <InstallPWA />
        </div>
      </motion.div>
    </div>
  );
};
