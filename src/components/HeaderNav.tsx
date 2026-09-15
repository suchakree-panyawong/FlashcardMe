import React from "react";
import { motion } from "framer-motion";
import { CardCategory } from "@/types/flashcard";
import { useLanguage } from "@/lib/language";
import { BookOpen, ShieldCheck, Home, Repeat, Grid, Database, ArrowLeftRight, Headphones } from "lucide-react";

export type NavTab = "home" | "study" | "library" | "listen" | "backup";

interface HeaderNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeMode: CardCategory | null;
  onSwitchMode: () => void;
  dueCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onSelectTab,
  activeMode,
  onSwitchMode,
  dueCount,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const labels = { home: t("home"), study: t("study"), library: t("library"), listen: t("listen"), backup: t("backup") };
  return (
    <>
      {/* Top Sticky Glassmorphism Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 px-4 py-3 shadow-xs transition-all">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-1 sm:px-3">
          {/* Logo Brand */}
          <div
            onClick={() => onSelectTab("home")}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md shadow-slate-200 sm:h-14 sm:w-24"
            >
              <img src="/flashcardme-logo-mainpage-Photoroom.png" alt="FlashcardMe" className="h-full w-full object-contain" />
            </motion.div>
          </div>

          {/* Active Mode Badge */}
          {activeMode && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onSwitchMode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 transition-all text-xs font-bold shadow-2xs"
            >
              {activeMode === "general" ? (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t("general")}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t("personal")}</span>
                </>
              )}
              <ArrowLeftRight className="w-3 h-3 opacity-50 ml-0.5" />
            </motion.button>
          )}
        </div>
      </header>

      <div className="fixed right-3 top-[4.5rem] z-40 flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-xl" aria-label="Language selector">
        {(["th", "en"] as const).map((option) => (
          <button key={option} type="button" onClick={() => setLanguage(option)} className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase transition-colors ${language === option ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-700"}`}>
            {option}
          </button>
        ))}
      </div>

      {/* Bottom Floating Glass Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/90 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl border-t border-slate-100/80 shadow-2xl">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-5 gap-1">

          {/* Tab 1: Home */}
          <button
            onClick={() => onSelectTab("home")}
            className={`relative flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === "home" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            {activeTab === "home" && (
              <motion.div layoutId="activeTabGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">{labels.home}</span>
          </button>

          {/* Tab 2: Study */}
          <button
            onClick={() => onSelectTab("study")}
            className={`relative flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === "study" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            {activeTab === "study" && (
              <motion.div layoutId="activeTabGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <Repeat className="w-5 h-5" />
            <span className="text-[10px] mt-1">{labels.study}</span>
            {dueCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                {dueCount > 99 ? "99+" : dueCount}
              </span>
            )}
          </button>

          {/* Tab 3: Library */}
          <button
            onClick={() => onSelectTab("library")}
            className={`relative flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === "library" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            {activeTab === "library" && (
              <motion.div layoutId="activeTabGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-1">{labels.library}</span>
          </button>

          {/* Tab 4: Listen & Learn */}
          <button
            onClick={() => onSelectTab("listen")}
            className={`relative flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === "listen" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            {activeTab === "listen" && (
              <motion.div layoutId="activeTabGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <Headphones className="w-5 h-5" />
            <span className="text-[10px] mt-1">{labels.listen}</span>
          </button>

          {/* Tab 5: Backup */}
          <button
            onClick={() => onSelectTab("backup")}
            className={`relative flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === "backup" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            {activeTab === "backup" && (
              <motion.div layoutId="activeTabGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <Database className="w-5 h-5" />
            <span className="text-[10px] mt-1">{labels.backup}</span>
          </button>

        </div>
      </nav>
    </>
  );
};
