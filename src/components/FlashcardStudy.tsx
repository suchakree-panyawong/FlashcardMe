"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Flashcard, ReviewRating, CardCategory } from "@/types/flashcard";
import { getDomainTagClassName } from "@/lib/domainTags";
import { useLanguage } from "@/lib/language";
import { clearStudySession, getStudySession, saveStudySession, StudySession } from "@/lib/storage";
import {
  Sparkles,
  ArrowLeft,
  Flame,
  Award,
  Volume2,
  Star,
  FileText,
  Shuffle,
  ArrowUpDown,
  RotateCcw,
  HelpCircle as QuestionIcon,
  ThumbsDown,
  Minus,
  ThumbsUp,
} from "lucide-react";

interface FlashcardStudyProps {
  dueCards: Flashcard[];
  hasCards?: boolean;
  mode: CardCategory;
  onReviewCard: (cardId: string, rating: ReviewRating) => void;
  onUndoReview?: () => void;
  onFinishStudy: () => void;
  onBackToMode: () => void;
  onToggleFavorite?: (cardId: string) => void;
}

function shuffleList<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  dueCards,
  hasCards = dueCards.length > 0,
  mode,
  onReviewCard,
  onFinishStudy,
  onBackToMode,
  onToggleFavorite,
  onUndoReview,
}) => {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<StudySession | null>(null);
  const [studyList, setStudyList] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const sessionInitialized = useRef(false);

  const persistSession = (nextList: Flashcard[], nextSessionCount: number, shuffled: boolean) => {
    if (nextList.length === 0) {
      clearStudySession();
      return;
    }
    saveStudySession({
      mode,
      cardIds: nextList.map((card) => card.id),
      sessionCount: nextSessionCount,
      isShuffled: shuffled,
      savedAt: new Date().toISOString(),
    });
  };

  // Restore the unfinished session once, then keep the list synchronized.
  useEffect(() => {
    if (!sessionInitialized.current) {
      const savedSession = getStudySession();
      const savedCards = savedSession?.mode === mode
        ? savedSession.cardIds
          .map((id) => dueCards.find((card) => card.id === id))
          .filter((card): card is Flashcard => Boolean(card))
        : [];
      if (savedSession?.mode === mode && savedCards.length > 0) {
        setResumePrompt(savedSession);
        sessionInitialized.current = true;
        return;
      }
      const nextList = savedCards.length > 0 ? savedCards : (isShuffled ? shuffleList(dueCards) : [...dueCards]);
      const nextShuffled = savedCards.length > 0 ? Boolean(savedSession?.isShuffled) : isShuffled;
      setStudyList(nextList);
      setIsShuffled(nextShuffled);
      setSessionCount(savedCards.length > 0 ? savedSession?.sessionCount ?? 0 : 0);
      persistSession(nextList, savedCards.length > 0 ? savedSession?.sessionCount ?? 0 : 0, nextShuffled);
      sessionInitialized.current = true;
      return;
    }

    setStudyList((previous) => previous.filter((card) => dueCards.some((dueCard) => dueCard.id === card.id)));
  }, [dueCards, mode]);

  const handleToggleOrder = (shuffle: boolean) => {
    if (shuffle === isShuffled) return;
    setIsShuffled(shuffle);
    const nextList = shuffle ? shuffleList(studyList) : [...studyList];
    setStudyList(nextList);
    persistSession(nextList, sessionCount, shuffle);
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  const startSession = (resume: boolean) => {
    const savedSession = resumePrompt;
    const restoredCards = resume && savedSession
      ? savedSession.cardIds
        .map((id) => dueCards.find((card) => card.id === id))
        .filter((card): card is Flashcard => Boolean(card))
      : [];
    const nextShuffled = resume && savedSession ? savedSession.isShuffled : false;
    const nextList = restoredCards.length > 0 ? restoredCards : [...dueCards];
    const nextCount = resume && savedSession ? savedSession.sessionCount : 0;

    if (!resume) clearStudySession();
    setResumePrompt(null);
    setIsShuffled(nextShuffled);
    setStudyList(nextList);
    setSessionCount(nextCount);
    setCurrentIndex(0);
    setIsFlipped(false);
    persistSession(nextList, nextCount, nextShuffled);
  };

  const currentCard = studyList[currentIndex];
  const isFinished = currentIndex >= studyList.length || !currentCard;

  useEffect(() => {
    if (isFinished && studyList.length > 0) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6"],
      });
    }
  }, [isFinished, studyList.length]);

  const speakVocab = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRating = (rating: ReviewRating) => {
    if (!currentCard) return;
    onReviewCard(currentCard.id, rating);
    setIsFlipped(false);
    setSessionCount((prev) => prev + 1);
    const remainingCards = studyList.filter((card) => card.id !== currentCard.id);
    setStudyList(remainingCards);
    setCurrentIndex(0);
    persistSession(remainingCards, sessionCount + 1, isShuffled);
    setCanUndo(Boolean(onUndoReview));
  };

  const finishStudy = () => {
    clearStudySession();
    onFinishStudy();
  };

  if (resumePrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 p-7 text-center space-y-5 shadow-soft my-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <RotateCcw className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">{t("resumeTitle")}</h2>
          <p className="text-sm text-slate-500 thai-text">{t("resumeMessage")}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => startSession(true)}
            className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
          >
            {t("resumeSession")}
          </button>
          <button
            onClick={() => startSession(false)}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
          >
            {t("startFresh")}
          </button>
        </div>
      </motion.div>
    );
  }

  if (studyList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-5 shadow-soft my-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">{hasCards ? t("noDueTitle") : t("emptyDeckTitle")}</h2>
          <p className="text-sm text-slate-500 thai-text">{hasCards ? t("noDueMessage") : t("emptyDeckMessage")}</p>
        </div>
        <button
          onClick={finishStudy}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all active:scale-95"
        >
          {t("backToHome")}
        </button>
        {canUndo && onUndoReview && (
          <button
            onClick={() => { onUndoReview(); setCanUndo(false); }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("reviewUndone")}</span>
          </button>
        )}
      </motion.div>
    );
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-6 shadow-soft my-6"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">เก่งมาก! ทบทวนครบแล้ว 🎉</h2>
          <p className="text-sm text-slate-500 thai-text">
            คุณได้ทบทวนการ์ดไปทั้งหมด <strong className="text-indigo-600 font-bold">{sessionCount}</strong> ใบในรอบนี้
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={finishStudy}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-indigo-200 transition-all active:scale-98"
          >
            กลับสู่หน้าหลัก
          </button>
          <button
            onClick={onBackToMode}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all"
          >
            เปลี่ยนโหมดการเรียนรู้
          </button>
        </div>
      </motion.div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / studyList.length) * 100);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header Controls, Order Toggle Pills & Progress Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onFinishStudy}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ออกจากการเรียน</span>
          </button>

          {/* Sequential vs Shuffle Mode Toggle Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-2xs">
            <button
              onClick={() => handleToggleOrder(false)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                !isShuffled
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>เรียงลำดับ</span>
            </button>
            <button
              onClick={() => handleToggleOrder(true)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isShuffled
                  ? "bg-white text-purple-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>สุ่ม (Shuffle)</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>
              {currentIndex + 1} / {studyList.length}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          />
        </div>
        <p className="text-center text-[10px] font-semibold text-slate-400">{t("autoSaved")}</p>
        {canUndo && onUndoReview && (
          <button
            onClick={() => { onUndoReview(); setCanUndo(false); }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("reviewUndone")}</span>
          </button>
        )}
      </div>

      {/* Interactive Card Container */}
      <div
        className="w-full min-h-[460px] cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            /* FRONT CARD (หน้าการ์ด: โจทย์ / คำศัพท์) */
            <motion.div
              key="front"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full min-h-[460px] bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex max-w-[85%] truncate rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${getDomainTagClassName(currentCard.domain || "General Vocabulary")}`}>
                  {currentCard.domain || "General Vocabulary"}
                </span>

                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(currentCard.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 transition-all text-amber-400"
                    aria-label={t("favorite")}
                  >
                    <Star className={`w-4 h-4 ${currentCard.isFavorite ? "fill-amber-400" : ""}`} />
                  </button>
                )}
              </div>

              {/* Center Content: Vocab English + Audio */}
              <div className="my-auto py-6 text-center space-y-4">
                <h3 className="text-4xl font-black tracking-tight text-slate-900">
                  {currentCard.vocab}
                </h3>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => speakVocab(currentCard.vocab, e)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold transition-all border border-indigo-100/80"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ฟังเสียงอ่าน (Audio)</span>
                </motion.button>
              </div>

              <div className="text-center pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-indigo-600 flex items-center justify-center space-x-1">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>แตะการ์ดเพื่อดูเฉลยและสถานการณ์ประกอบ</span>
                </p>
              </div>
            </motion.div>
          ) : (
            /* BACK CARD (คำแปล รายละเอียด และสถานการณ์ประกอบ) */
            <motion.div
              key="back"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full min-h-[460px] bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <span className={`inline-flex max-w-[58%] items-center truncate rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${getDomainTagClassName(currentCard.domain || "General Vocabulary")}`}>
                  <span className="truncate">{currentCard.domain || "General Vocabulary"}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-indigo-600">
                  <QuestionIcon className="w-4 h-4 text-indigo-600" />
                  <span>เฉลยและบริบท</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => speakVocab(currentCard.vocab, e)}
                    className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-slate-800">
                    {currentCard.vocab}
                  </span>
                </div>
              </div>

              {/* Answer Content Section */}
              <div className="my-auto space-y-3 py-2">
                {/* 1. ความหมายภาษาไทย */}
                {currentCard.vocabThai && (
                  <div className="text-center bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      ความหมายภาษาไทย
                    </span>
                    <h4 className="text-2xl font-black text-indigo-700 thai-text mt-0.5">
                      {currentCard.vocabThai}
                    </h4>
                  </div>
                )}

                {/* 2. คำอธิบายภาษาไทย */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    คำอธิบาย (Explanation)
                  </span>
                  <p className="text-sm text-slate-800 thai-text leading-relaxed font-semibold">
                    {currentCard.meaning}
                  </p>
                </div>

                {/* 3. Example scenario and real application */}
                {mode === "cert" && currentCard.scenario && (
                  <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-200/90 rounded-2xl p-4 text-left space-y-2">
                    <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>สถานการณ์ตัวอย่าง (Example Scenario)</span>
                    </span>
                    <div className="text-xs font-medium text-slate-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200/60 space-y-2 whitespace-pre-line">
                      {currentCard.scenario}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-3 gap-2.5 pt-2"
          >
            <button
              onClick={() => handleRating("hard")}
              aria-label="ยังจำไม่ได้"
              className="group flex min-h-[118px] flex-col items-center justify-center gap-1.5 rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-3 text-rose-700 shadow-sm transition-all hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100 active:translate-y-0 active:scale-95"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 transition-transform group-hover:scale-110">
                <ThumbsDown className="h-5 w-5" />
              </span>
              <span className="font-extrabold text-xs">ยังจำไม่ได้</span>
              <span className="text-[10px] font-medium text-rose-400">ทบทวนเร็วๆ นี้</span>
            </button>

            <button
              onClick={() => handleRating("good")}
              aria-label="พอจำได้"
              className="group flex min-h-[118px] flex-col items-center justify-center gap-1.5 rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white p-3 text-amber-700 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 active:translate-y-0 active:scale-95"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
                <Minus className="h-5 w-5" />
              </span>
              <span className="font-extrabold text-xs">พอจำได้</span>
              <span className="text-[10px] font-medium text-amber-500">เว้น 2-3 วัน</span>
            </button>

            <button
              onClick={() => handleRating("easy")}
              aria-label="จำได้แม่น"
              className="group flex min-h-[118px] flex-col items-center justify-center gap-1.5 rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-3 text-emerald-700 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 active:translate-y-0 active:scale-95"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                <ThumbsUp className="h-5 w-5" />
              </span>
              <span className="font-extrabold text-xs">จำได้แม่น</span>
              <span className="text-[10px] font-medium text-emerald-500">เว้น 5-7 วัน</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
