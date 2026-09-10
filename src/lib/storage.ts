import { Flashcard } from '@/types/flashcard';
import { validateImportData } from '@/lib/security';

const publicCard = (
  id: string,
  vocab: string,
  vocabThai: string,
  meaning: string,
  pattern: string
): Flashcard => ({
  id,
  vocab,
  vocabThai,
  meaning,
  domain: 'General Vocab',
  pattern,
  scenario: '',
  nextReviewDate: new Date().toISOString(),
  interval: 1,
  category: 'general',
  createdAt: new Date().toISOString(),
});

// Public starter cards only. Personal decks are imported into LocalStorage by each user.
export const INITIAL_FLASHCARDS: Flashcard[] = [
  publicCard('public-gen-001', 'Resilience', 'ความยืดหยุ่นและการฟื้นตัวได้ดี', 'ความสามารถในการปรับตัวและฟื้นตัวจากปัญหาหรือสภาวะวิกฤตได้อย่างรวดเร็ว', 'Mental & System Adaptability'),
  publicCard('public-gen-002', 'Synchronize', 'ทำให้พร้อมกัน / ประสานงาน', 'การทำให้สิ่งต่างๆ ทำงานพร้อมกัน สอดคล้องกัน หรือมีข้อมูลตรงกันในเวลาเดียวกัน', 'Syncing data across devices'),
  publicCard('public-gen-003', 'Efficiency', 'ประสิทธิภาพ', 'ความสามารถในการทำงานให้สำเร็จโดยใช้ทรัพยากรน้อยที่สุดและเกิดผลลัพธ์สูงสุด', 'Optimal Resource Usage'),
  publicCard('public-gen-004', 'Benchmark', 'เกณฑ์มาตรฐานอ้างอิง', 'จุดอ้างอิงหรือเกณฑ์มาตรฐานที่ใช้เปรียบเทียบ ประเมิน หรือวัดระดับคุณภาพ', 'Performance standard'),
  publicCard('public-gen-005', 'Vulnerability', 'ความเปราะบาง / ช่องโหว่', 'จุดอ่อนหรือช่องโหว่ที่อาจทำให้เกิดความเสียหายหรือถูกโจมตีได้ง่าย', 'System exposure point'),
];

const STORAGE_KEY = 'flashcardme_cards_v8';

export function getStoredFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return INITIAL_FLASHCARDS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      const validated = validateImportData(parsed);
      if (validated.isValid) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validated.cards));
        return validated.cards;
      }
    }

    const starterCards = INITIAL_FLASHCARDS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterCards));
    return starterCards;
  } catch (error) {
    console.error('Failed to load flashcards:', error);
    return INITIAL_FLASHCARDS;
  }
}

export function saveStoredFlashcards(cards: Flashcard[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Failed to save flashcards:', error);
  }
}

export function resetToDefaultFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return INITIAL_FLASHCARDS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FLASHCARDS));
  return INITIAL_FLASHCARDS;
}
