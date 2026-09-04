import React, { useState, useEffect } from "react";
import { CardCategory, Flashcard, DOMAIN_OPTIONS } from "@/types/flashcard";
import { sanitizeText } from "@/lib/security";
import { X, Plus, Sparkles, BookOpen, ShieldCheck } from "lucide-react";

interface FlashcardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<Flashcard, "id" | "nextReviewDate" | "interval" | "createdAt">) => void;
  editingCard?: Flashcard | null;
  defaultCategory?: CardCategory;
}

export const FlashcardFormModal: React.FC<FlashcardFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCard = null,
  defaultCategory = "general",
}) => {
  const [vocab, setVocab] = useState("");
  const [vocabThai, setVocabThai] = useState("");
  const [meaning, setMeaning] = useState("");
  const [domain, setDomain] = useState<string>("Security Principles");
  const [pattern, setPattern] = useState("");
  const [scenario, setScenario] = useState("");
  const [category, setCategory] = useState<CardCategory>(defaultCategory);

  useEffect(() => {
    if (editingCard) {
      setVocab(editingCard.vocab || "");
      setVocabThai(editingCard.vocabThai || "");
      setMeaning(editingCard.meaning || "");
      setDomain(editingCard.domain || "Security Principles");
      setPattern(editingCard.pattern || "");
      setScenario(editingCard.scenario || "");
      setCategory(editingCard.category || "cert");
    } else {
      setVocab("");
      setVocabThai("");
      setMeaning("");
      setDomain("Security Principles");
      setPattern("");
      setScenario("");
      setCategory(defaultCategory);
    }
  }, [editingCard, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanVocab = sanitizeText(vocab);
    const cleanVocabThai = sanitizeText(vocabThai);
    const cleanMeaning = sanitizeText(meaning);

    if (!cleanVocab || !cleanMeaning) {
      alert("กรุณากรอกคำศัพท์และความหมายภาษาไทย");
      return;
    }

    onSave({
      vocab: cleanVocab,
      vocabThai: cleanVocabThai,
      meaning: cleanMeaning,
      domain: category === "general" ? "General Vocab" : domain,
      pattern: sanitizeText(pattern),
      scenario: sanitizeText(scenario),
      category,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {editingCard ? "แก้ไขการ์ดคำศัพท์" : "สร้างการ์ดใหม่"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              เลือกประเภทการ์ด
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory("general")}
                className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border font-bold text-xs transition-all ${
                  category === "general"
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>ศัพท์ทั่วไป (มินิมอล)</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("cert")}
                className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border font-bold text-xs transition-all ${
                  category === "cert"
                    ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>คลังส่วนตัว</span>
              </button>
            </div>
          </div>

          {/* Vocab English */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              คำศัพท์ (ภาษาอังกฤษ / คำหลัก) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Confidentiality หรือ Resilience"
              value={vocab}
              onChange={(e) => setVocab(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold text-slate-900 placeholder:text-slate-300 text-sm outline-none transition-all"
            />
          </div>

          {/* Thai Vocab Translation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              คำแปลภาษาไทย (คำสั้นๆ)
            </label>
            <input
              type="text"
              placeholder="เช่น การรักษาความลับ หรือ ความยืดหยุ่น"
              value={vocabThai}
              onChange={(e) => setVocabThai(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold text-slate-900 placeholder:text-slate-300 text-sm outline-none transition-all thai-text"
            />
          </div>

          {/* Meaning / Explanation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายความหมาย (ภาษาไทย) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="อธิบายความหมายสั้นๆ เข้าใจง่าย..."
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-slate-900 placeholder:text-slate-300 text-sm outline-none transition-all thai-text leading-relaxed"
            />
          </div>

          {/* Extra Fields for Cert Mode */}
          {category === "cert" && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  หมวดหมู่ความรู้ (Domain)
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold text-slate-900 text-sm outline-none bg-white transition-all"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  สถานการณ์ข้อสอบ (Exam Scenario)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น บริษัทใช้ AES-256 เข้ารหัสข้อมูลลูกค้า..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-slate-900 placeholder:text-slate-300 text-sm outline-none transition-all thai-text leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingCard ? "บันทึกการแก้ไข" : "บันทึกการ์ดใหม่"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
