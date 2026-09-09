import React from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '@/types/flashcard';
import { isDueToday } from '@/lib/spacedRepetition';
import { BookOpen, ArrowRight, Layers, Plus, Trophy, Flame } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface StatsOverviewProps {
  cards: Flashcard[];
  onStartStudy: () => void;
  onOpenAddModal?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  cards,
  onStartStudy,
  onOpenAddModal,
}) => {
  const { t } = useLanguage();
  const totalCards = cards.length;
  const dueCards = cards.filter((c) => isDueToday(c.nextReviewDate));
  const dueCount = dueCards.length;
  const masteredCount = cards.filter((c) => (c.interval || 0) >= 7).length;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Hero Banner with Framer Motion hover & active spring dynamics */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4 relative overflow-hidden"
      >
        {/* Decorative Background Aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/60 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-extrabold flex items-center space-x-1">
            <span>Spaced Repetition Engine</span>
          </span>
          {dueCount > 0 && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>{dueCount} {t('dueNeedReview')}</span>
            </span>
          )}
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('dueCards')} {dueCount} {t('cardCount')}
          </h2>
          <p className="text-sm text-slate-500 mt-1 thai-text leading-relaxed">
            {dueCount > 0
              ? t('reviewPrompt')
              : `${t('allReviewed')} 🏆`}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: dueCount > 0 ? 1.02 : 1 }}
          whileTap={{ scale: dueCount > 0 ? 0.98 : 1 }}
          onClick={onStartStudy}
          disabled={dueCount === 0}
          className={`w-full py-4 px-5 rounded-2xl font-black text-base flex items-center justify-center space-x-2.5 transition-all relative z-10 ${
            dueCount > 0
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>
            {dueCount > 0 ? `${t('startReviewNow')} (${dueCount} ${t('cardCount')})` : `${t('allReviewedShort')} 🎉`}
          </span>
          {dueCount > 0 && <ArrowRight className="w-4 h-4" />}
        </motion.button>
      </motion.div>

      {/* Stats Grid with Interactive Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-soft"
        >
          <span className="text-2xl font-black text-rose-500 block">{dueCount}</span>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mt-0.5">{t('dueToReview')}</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-soft"
        >
          <span className="text-2xl font-black text-slate-900 block">{totalCards}</span>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mt-0.5">{t('totalCards')}</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-soft"
        >
          <span className="text-2xl font-black text-emerald-500 block">{masteredCount}</span>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mt-0.5">{t('mastered')}</span>
        </motion.div>
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
