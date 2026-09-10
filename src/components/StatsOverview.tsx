import React from 'react';
import { motion } from 'framer-motion';
import { Flashcard, StudyFocus, StudyStats } from '@/types/flashcard';
import { isDueToday } from '@/lib/spacedRepetition';
import { BookOpen, ArrowRight, Layers, Plus, Trophy, Flame } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface StatsOverviewProps {
  cards: Flashcard[];
  studyStats: StudyStats;
  studyFocus: StudyFocus;
  onSetDailyGoal: (goal: number) => void;
  onEnableNotifications: () => void;
  notificationsSupported: boolean;
  onStartStudy: () => void;
  onOpenAddModal?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  cards,
  studyStats,
  studyFocus,
  onSetDailyGoal,
  onEnableNotifications,
  notificationsSupported,
  onStartStudy,
  onOpenAddModal,
}) => {
  const { t } = useLanguage();
  const totalCards = cards.length;
  const dueCards = cards.filter((c) => {
    const due = isDueToday(c.nextReviewDate);
    const focused = studyFocus === 'all'
      || (studyFocus === 'favorites' && c.isFavorite)
      || (studyFocus === 'mistakes' && (c.incorrectCount ?? 0) > 0)
      || (studyFocus === 'unseen' && (c.reviewCount ?? 0) === 0);
    return due && focused;
  });
  const dueCount = dueCards.length;
  const masteredCount = cards.filter((c) => (c.interval || 0) >= 7).length;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
  const correctCount = cards.reduce((sum, card) => sum + (card.correctCount ?? 0), 0);
  const incorrectCount = cards.reduce((sum, card) => sum + (card.incorrectCount ?? 0), 0);
  const answeredCount = correctCount + incorrectCount;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayReviews = studyStats.dailyReviews[todayKey] ?? 0;
  const goalProgress = Math.min(100, Math.round((todayReviews / studyStats.dailyGoal) * 100));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Hero Banner with Framer Motion hover & active spring dynamics */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-card"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-50/70 blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Focus today
            </span>
            {dueCount > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">
                <Flame className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                {dueCount} due
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {totalCards === 0 ? t('emptyDeckTitle') : dueCount > 0 ? `${dueCount} ${t('cardCount')} to review` : t('noDueTitle')}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 thai-text">
              {totalCards === 0
                ? t('emptyDeckMessage')
                : dueCount > 0
                ? 'เรียนแค่สิ่งที่ถึงเวลา แฟกัสทีละคำโดยไม่กระจายความคิด'
                : 'ทุกอย่างพร้อมแล้ว ก้าวต่อไปด้วยความมั่นใจ'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Today progress</span>
              <span>{Math.min(100, goalProgress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div animate={{ width: `${Math.min(100, goalProgress)}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              {todayReviews} / {studyStats.dailyGoal} {t('cardsToday')}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: dueCount > 0 ? 1.02 : 1 }}
            whileTap={{ scale: dueCount > 0 ? 0.98 : 1 }}
            onClick={onStartStudy}
            disabled={totalCards > 0 && dueCount === 0}
            className={`flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-base font-black transition-all ${
              dueCount > 0 || totalCards === 0
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                : 'cursor-not-allowed bg-slate-100 text-slate-400 shadow-none'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>
              {dueCount > 0 ? `${t('startReviewNow')}` : totalCards === 0 ? t('addNewCard') : `${t('allReviewedShort')} 🎉`}
            </span>
            {dueCount > 0 && <ArrowRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid with Interactive Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center shadow-soft"
        >
          <span className="block text-2xl font-black text-rose-500">{dueCount}</span>
          <span className="mt-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-rose-600">{t('dueToReview')}</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-soft"
        >
          <span className="block text-2xl font-black text-slate-900">{totalCards}</span>
          <span className="mt-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{t('totalCards')}</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center shadow-soft"
        >
          <span className="block text-2xl font-black text-emerald-500">{masteredCount}</span>
          <span className="mt-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-600">{t('mastered')}</span>
        </motion.div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-xs font-bold text-indigo-700">
        <span>{t('totalReviews')}: {studyStats.totalReviews}</span>
        <span>{t('streak')}: {studyStats.currentStreak} {t('days')}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-slate-800">{t('dailyGoal')}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{todayReviews} / {studyStats.dailyGoal} {t('cardsToday')}</p>
          </div>
          <select
            value={studyStats.dailyGoal}
            onChange={(event) => onSetDailyGoal(Number(event.target.value))}
            aria-label={t('dailyGoal')}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-600 outline-none"
          >
            {[5, 10, 20, 30].map((goal) => <option key={goal} value={goal}>{goal}</option>)}
          </select>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <motion.div animate={{ width: `${goalProgress}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
        </div>
      </div>

      {notificationsSupported && (
        <button
          onClick={onEnableNotifications}
          className="flex w-full items-center justify-between rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-left transition hover:border-teal-200 hover:bg-teal-50 active:scale-[0.99]"
        >
          <span>
            <strong className="block text-xs font-black text-teal-800">{t('notificationsTitle')}</strong>
            <span className="text-[11px] text-teal-700/70">{t('notificationsHint')}</span>
          </span>
          <span className="rounded-xl bg-white px-3 py-2 text-[11px] font-black text-teal-700 shadow-sm">{t('enable')}</span>
        </button>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
          <strong className="block text-xl text-emerald-600">{correctCount}</strong>
          <span className="text-[10px] font-bold text-emerald-700">{t('correctAnswers')}</span>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center">
          <strong className="block text-xl text-rose-600">{incorrectCount}</strong>
          <span className="text-[10px] font-bold text-rose-700">{t('incorrectAnswers')}</span>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-center">
          <strong className="block text-xl text-sky-600">{accuracy}%</strong>
          <span className="text-[10px] font-bold text-sky-700">{t('accuracy')}</span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      {totalCards > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700">{t('masteryLevel')}</span>
            </div>
            <span className="text-xs font-black text-indigo-600">
              {masteryPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${masteryPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full rounded-full"
            />
          </div>

          <p className="text-[10px] text-slate-400 font-semibold mt-2 thai-text">
            {masteredCount} / {totalCards} {t('masteryNote')} (7+ days)
          </p>
        </div>
      )}

      {/* Domain Categories breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>{t('categories')}</span>
          </h3>
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1 text-xs font-bold text-indigo-600 px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addNewCard')}</span>
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-3xl">📭</p>
            <p className="text-sm text-slate-500 font-medium thai-text">{t('noCards')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from(new Set(cards.map((c) => c.domain || 'General'))).map((domain) => {
              const count = cards.filter((c) => c.domain === domain).length;
              const domainDue = dueCards.filter((c) => c.domain === domain).length;
              return (
                <div key={domain} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600 font-semibold truncate pr-2 max-w-[65%]">{domain}</span>
                  <div className="flex items-center space-x-2 shrink-0">
                    {domainDue > 0 && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {domainDue} due
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                      {count} {t('cardCount')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
