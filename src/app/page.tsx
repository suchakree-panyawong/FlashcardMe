"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CardCategory, Flashcard, ReviewRating, ToastMessage } from "@/types/flashcard";
import {
  getStoredFlashcards,
  saveStoredFlashcards,
  resetToDefaultFlashcards,
} from "@/lib/storage";
import { calculateNextReview } from "@/lib/spacedRepetition";
import { HeaderNav, NavTab } from "@/components/HeaderNav";
import { ModeSelector } from "@/components/ModeSelector";
import { StatsOverview } from "@/components/StatsOverview";
import { FlashcardStudy } from "@/components/FlashcardStudy";
import { FlashcardLibrary } from "@/components/FlashcardLibrary";
import { AudioLearn } from "@/components/AudioLearn";
import { DataImportExport } from "@/components/DataImportExport";
import { FlashcardFormModal } from "@/components/FlashcardFormModal";
import { ToastContainer } from "@/components/Toast";
import { InstallPWA } from "@/components/InstallPWA";
import { LanguageProvider, useLanguage } from "@/lib/language";
import { areDuplicateWords } from "@/lib/duplicateWords";
import { Sparkles } from "lucide-react";

// ─── Toast helper ─────────────────────────────────────────────────────────────

let toastCounter = 0;

function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message?: string, type: ToastMessage["type"] = "success") => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <LanguageProvider>
      <FlashcardApp />
    </LanguageProvider>
  );
}

function FlashcardApp() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<CardCategory | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const { toasts, addToast, removeToast } = useToasts();
  const { t } = useLanguage();

  // Load cards from localStorage
  useEffect(() => {
    const stored = getStoredFlashcards();
    setCards(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const activeModeCards = useMemo(
    () => cards.filter((c) => (c.category ?? "general") === activeMode),
    [cards, activeMode]
  );

  const activeModeDueCards = useMemo(() => {
    return activeModeCards.filter((card) => {
      return card.nextReviewDate.split("T")[0] <= todayStr;
    });
  }, [activeModeCards, todayStr]);

  const handleReviewCard = useCallback(
    (cardId: string, rating: ReviewRating) => {
      setCards((prevCards) => {
        const updated = prevCards.map((card) => {
          if (card.id === cardId) {
            const { nextReviewDate, interval } = calculateNextReview(card, rating);
            return { ...card, nextReviewDate, interval };
          }
          return card;
        });
        saveStoredFlashcards(updated);
        return updated;
      });
      addToast(t("reviewSaved"));
    },
    [addToast]
  );

  const handleSaveCard = useCallback(
    (cardData: Omit<Flashcard, "id" | "nextReviewDate" | "interval" | "createdAt">) => {
      if (!cardData.vocab.trim()) {
        addToast(t("enterWord"), undefined, "error");
        return false;
      }

      if (!editingCard && cards.some((card) => areDuplicateWords(card.vocab, cardData.vocab))) {
        const duplicateCard = cards.find((card) => areDuplicateWords(card.vocab, cardData.vocab));
        addToast(t("duplicateWord"), duplicateCard?.vocab, "error");
        return false;
      }

      setCards((prev) => {
        let updated: Flashcard[];
        if (editingCard) {
          updated = prev.map((c) => (c.id === editingCard.id ? { ...c, ...cardData } : c));
        } else {
          const newCard: Flashcard = {
            ...cardData,
            id: `fm-user-${Date.now()}`,
            nextReviewDate: new Date().toISOString(),
            interval: 1,
            createdAt: new Date().toISOString(),
          };
          updated = [newCard, ...prev];
        }
        saveStoredFlashcards(updated);
        return updated;
      });
      if (editingCard) {
        addToast(t("cardUpdated"));
      } else {
        addToast(t("cardAdded"), cardData.vocab);
      }
      setIsModalOpen(false);
      setEditingCard(null);
      return true;
    },
    [cards, editingCard, addToast, t]
  );

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      setCards((prev) => {
        const updated = prev.filter((c) => c.id !== cardId);
        saveStoredFlashcards(updated);
        return updated;
      });
      addToast(t("cardDeleted"), undefined, "info");
    },
    [addToast]
  );

  const handleImportCards = useCallback(
    (importedCards: Flashcard[]) => {
      const cardsById = new Map(cards.map((card) => [card.id, card]));
      let addedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      importedCards.forEach((card) => {
        if (cardsById.has(card.id)) {
          cardsById.set(card.id, card);
          updatedCount += 1;
          return;
        }
        const duplicateWord = Array.from(cardsById.values()).some((existingCard) =>
          areDuplicateWords(existingCard.vocab, card.vocab)
        );
        if (duplicateWord) {
          skippedCount += 1;
          return;
        }
        cardsById.set(card.id, card);
        addedCount += 1;
      });

      const mergedCards = Array.from(cardsById.values());
      setCards(mergedCards);
      saveStoredFlashcards(mergedCards);
      return { addedCount, updatedCount, skippedCount };
    },
    [cards]
  );

  const handleResetCards = useCallback(() => {
    const resetCards = resetToDefaultFlashcards();
    setCards(resetCards);
    addToast(t("resetDone"));
  }, [addToast, t]);

  const handleSelectMode = (mode: CardCategory) => {
    setActiveMode(mode);
    setActiveTab("home");
  };

  // ── Loading Screen ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="text-slate-400 font-bold text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // ── Full-screen Mode Selector (no header, no bottom nav) ────────────────────
  if (!activeMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <ModeSelector
          cards={cards}
          onSelectMode={handleSelectMode}
          onOpenAddModal={() => {
            setEditingCard(null);
            setIsModalOpen(true);
          }}
        />
        <FlashcardFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCard(null);
          }}
          onSave={handleSaveCard}
          editingCard={editingCard}
          defaultCategory="general"
        />
      </div>
    );
  }

  // ── Main App (with Header + Bottom Nav) ─────────────────────────────────────
  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeMode={activeMode}
        onSwitchMode={() => setActiveMode(null)}
        dueCount={activeModeDueCards.length}
      />

      <div className="mx-auto w-full max-w-md px-4 pt-3">
        <InstallPWA />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10">

        {activeTab === "home" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {t("modeSelected")}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1 thai-text">
                  {activeMode === "general" ? `📚 ${t("homeModeGeneral")}` : `🛡️ ${t("homeModePersonal")}`}
                </h2>
              </div>
              <button
                onClick={() => setActiveMode(null)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 transition-colors"
              >
                {t("changeMode")}
              </button>
            </div>

            <StatsOverview
              cards={activeModeCards}
              onStartStudy={() => {
                if (activeModeCards.length === 0) {
                  setEditingCard(null);
                  setIsModalOpen(true);
                } else {
                  setActiveTab("study");
                }
              }}
              onOpenAddModal={() => {
                setEditingCard(null);
                setIsModalOpen(true);
              }}
            />

          </div>
        )}

        {activeTab === "study" && (
          <FlashcardStudy
            dueCards={activeModeDueCards}
            hasCards={activeModeCards.length > 0}
            mode={activeMode}
            onReviewCard={handleReviewCard}
            onFinishStudy={() => setActiveTab("home")}
            onBackToMode={() => setActiveMode(null)}
          />
        )}

        {activeTab === "library" && (
          <FlashcardLibrary
            cards={cards}
            activeMode={activeMode}
            onAddCard={() => {
              setEditingCard(null);
              setIsModalOpen(true);
            }}
            onEditCard={(card) => {
              setEditingCard(card);
              setIsModalOpen(true);
            }}
            onDeleteCard={handleDeleteCard}
          />
        )}

        {activeTab === "listen" && (
          <AudioLearn
            cards={activeModeCards}
            activeMode={activeMode}
          />
        )}

        {activeTab === "backup" && (
          <DataImportExport
            cards={cards}
            onImportCards={handleImportCards}
            onResetToDefault={handleResetCards}
            showToast={addToast}
          />
        )}
      </main>

      <FlashcardFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
        defaultCategory={activeMode}
      />
    </div>
  );
}
