"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlarmClock, ArrowLeft, BrainCircuit, Check, CircleDot, RotateCcw, Trophy } from "lucide-react";
import { Flashcard, ReviewRating } from "@/types/flashcard";
import { useLanguage } from "@/lib/language";

interface SpeedRunStudyProps {
  cards: Flashcard[];
  onReviewCard: (cardId: string, rating: ReviewRating) => void;
  onFinish: () => void;
}

const SPEED_LIMIT_SECONDS = 10;

function shuffleCards(cards: Flashcard[]) {
  return [...cards].sort(() => Math.random() - 0.5).slice(0, 50);
}

export const SpeedRunStudy: React.FC<SpeedRunStudyProps> = ({ cards, onReviewCard, onFinish }) => {
  const { t } = useLanguage();
  const [runCards] = useState<Flashcard[]>(() => shuffleCards(cards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SPEED_LIMIT_SECONDS);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timedOut, setTimedOut] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = runCards[currentIndex];
  const hasFinished = isComplete || currentIndex >= runCards.length;

  useEffect(() => {
    if (!currentCard || isComplete) return;
    setSecondsLeft(SPEED_LIMIT_SECONDS);
    setIsRevealed(false);

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          onReviewCard(currentCard.id, "hard");
          setTimedOut((count) => count + 1);
          setCurrentIndex((index) => index + 1);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentCard, isComplete, onReviewCard]);

  useEffect(() => {
    if (runCards.length > 0 && currentIndex >= runCards.length) setIsComplete(true);
  }, [currentIndex, runCards.length]);

  const handleRating = (rating: ReviewRating) => {
    if (!currentCard) return;
    onReviewCard(currentCard.id, rating);
    if (rating === "easy") setScore((value) => value + 2);
    if (rating === "good") setScore((value) => value + 1);
    setCurrentIndex((index) => index + 1);
  };

  if (runCards.length === 0) {
    return (
      <div className="mx-auto my-6 max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <AlarmClock className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-black text-slate-900">{t("speedRunEmpty")}</h2>
        <button onClick={onFinish} className="mt-5 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">
          {t("finishSession")}
        </button>
      </div>
    );
  }

  if (hasFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto my-6 max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t("speedRunComplete")}</h2>
          <p className="mt-2 text-sm text-slate-500">{score} {t("speedRunPoints")} · {timedOut} {t("speedRunTimeouts")}</p>
        </div>
        <button onClick={onFinish} className="w-full rounded-2xl bg-slate-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-slate-800">
          {t("finishSession")}
        </button>
      </motion.div>
    );
  }

  const progress = Math.round((currentIndex / runCards.length) * 100);
  const timerColor = secondsLeft <= 3 ? "text-amber-600" : "text-slate-700";

  return (
    <div className="mx-auto max-w-md space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button onClick={onFinish} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("finishSession")}
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-black text-white">
          <AlarmClock className="h-3.5 w-3.5" /> {secondsLeft}s
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-slate-600" />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-card">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>{t("speedRunTitle")}</span>
          <span>{currentIndex + 1}/{runCards.length}</span>
        </div>
        <div className={`mt-10 text-6xl font-black ${timerColor}`}>{secondsLeft}</div>
        <h2 className="mt-8 text-3xl font-black tracking-tight text-slate-900">{currentCard.vocab}</h2>
        <button onClick={() => setIsRevealed((value) => !value)} className="mt-5 text-xs font-bold text-slate-500 underline underline-offset-4">
          {isRevealed ? currentCard.vocabThai || currentCard.meaning : t("speedRunReveal")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <button onClick={() => handleRating("hard")} className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700">
          <BrainCircuit className="h-5 w-5" />
          <span className="text-[10px] font-black">{t("reviewAgain")}</span>
        </button>
        <button onClick={() => handleRating("good")} className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
          <CircleDot className="h-5 w-5" />
          <span className="text-[10px] font-black">{t("gettingThere")}</span>
        </button>
        <button onClick={() => handleRating("easy")} className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
          <Check className="h-5 w-5" />
          <span className="text-[10px] font-black">{t("gotIt")}</span>
        </button>
      </div>
      <p className="text-center text-[11px] font-semibold text-slate-400">{t("speedRunHint")}</p>
    </div>
  );
};
