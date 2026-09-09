import React, { useState, useMemo } from "react";
import { Flashcard, CardCategory } from "@/types/flashcard";
import { speakText } from "@/lib/speech";
import { Search, Plus, Trash2, Edit3, Volume2, BookOpen, ShieldCheck, Filter } from "lucide-react";
import { getDomainTagClassName } from "@/lib/domainTags";

interface FlashcardLibraryProps {
  cards: Flashcard[];
  activeMode: CardCategory | null;
  onAddCard: () => void;
  onEditCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
}

export const FlashcardLibrary: React.FC<FlashcardLibraryProps> = ({
  cards,
  activeMode,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CardCategory>(activeMode || "all");

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchSearch =
        card.vocab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.vocabThai && card.vocabThai.toLowerCase().includes(searchTerm.toLowerCase())) ||
        card.meaning.toLowerCase().includes(searchTerm.toLowerCase());

      const cardCat = card.category || (card.domain === "General Vocab" ? "general" : "cert");
      const matchCategory = categoryFilter === "all" || cardCat === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [cards, searchTerm, categoryFilter]);

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Header & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">คลังการ์ดทั้งหมด</h2>
          <p className="text-xs text-slate-500 font-medium">
            จัดการ เพิ่ม แก้ไข หรือลบการ์ดคำศัพท์ของคุณ ({cards.length} ใบ)
          </p>
        </div>
        <button
          onClick={onAddCard}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มการ์ด</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="ค้นหาคำศัพท์ คำแปล หรือความหมาย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-all thai-text"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 ${
            categoryFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>ทั้งหมด ({cards.length})</span>
        </button>

        <button
          onClick={() => setCategoryFilter("general")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 ${
            categoryFilter === "general"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>ศัพท์ทั่วไป</span>
        </button>

        <button
          onClick={() => setCategoryFilter("cert")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 ${
            categoryFilter === "cert"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 text-purple-600 hover:bg-purple-100"
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>ส่วนตัว</span>
        </button>
      </div>

      {/* Cards List */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 space-y-3">
          <p className="text-slate-400 text-sm font-medium">ไม่พบการ์ดคำศัพท์ที่คุณค้นหา</p>
          <button
            onClick={onAddCard}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors inline-block"
          >
            + สร้างการ์ดใบแรกเลย
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCards.map((card) => {
            const isGen = card.category === "general" || card.domain === "General Vocab";

            return (
              <div
                key={card.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-soft transition-all space-y-2.5"
              >
                {/* Top Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getDomainTagClassName(card.domain || (isGen ? "General Vocab" : "Personal Deck"))}`}
                  >
                    {card.domain || (isGen ? "General Vocab" : "Personal Deck")}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => speakText(card.vocab)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="ฟังเสียงอ่าน"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบการ์ด "${card.vocab}" ใช่หรือไม่?`)) {
                          onDeleteCard(card.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบการ์ด"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-lg font-black text-slate-900">{card.vocab}</h3>
                    {card.vocabThai && (
                      <span className="text-sm font-bold text-emerald-600 thai-text">
                        ({card.vocabThai})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-1 thai-text leading-relaxed line-clamp-2">
                    {card.meaning}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
