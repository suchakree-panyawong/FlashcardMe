import { Flashcard, StudyStats } from '@/types/flashcard';
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
const SAFETY_BACKUP_KEY = 'flashcardme_safety_backup_v1';
const STUDY_STATS_KEY = 'flashcardme_study_stats_v1';
const STUDY_SESSION_KEY = 'flashcardme_study_session_v1';

export interface StudySession {
  mode: 'general' | 'cert';
  cardIds: string[];
  sessionCount: number;
  isShuffled: boolean;
  savedAt: string;
}

export function getStudySession(): StudySession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STUDY_SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StudySession>;
    if (
      (parsed.mode !== 'general' && parsed.mode !== 'cert') ||
      !Array.isArray(parsed.cardIds) ||
      typeof parsed.sessionCount !== 'number' ||
      typeof parsed.isShuffled !== 'boolean' ||
      typeof parsed.savedAt !== 'string'
    ) return null;
    return {
      mode: parsed.mode,
      cardIds: parsed.cardIds.filter((id): id is string => typeof id === 'string'),
      sessionCount: parsed.sessionCount,
      isShuffled: parsed.isShuffled,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveStudySession(session: StudySession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STUDY_SESSION_KEY, JSON.stringify(session));
}

export function clearStudySession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STUDY_SESSION_KEY);
}

const DEFAULT_STUDY_STATS: StudyStats = {
  currentStreak: 0,
  lastReviewDate: '',
  totalReviews: 0,
};

export function getStudyStats(): StudyStats {
  if (typeof window === 'undefined') return DEFAULT_STUDY_STATS;
  try {
    const stored = localStorage.getItem(STUDY_STATS_KEY);
    if (!stored) return DEFAULT_STUDY_STATS;
    const parsed = JSON.parse(stored) as Partial<StudyStats>;
    return {
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      lastReviewDate: typeof parsed.lastReviewDate === 'string' ? parsed.lastReviewDate : '',
      totalReviews: typeof parsed.totalReviews === 'number' ? parsed.totalReviews : 0,
    };
  } catch {
    return DEFAULT_STUDY_STATS;
  }
}

export function saveStudyStats(stats: StudyStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STUDY_STATS_KEY, JSON.stringify(stats));
}

export function createSafetyBackup(cards: Flashcard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAFETY_BACKUP_KEY, JSON.stringify({
      createdAt: new Date().toISOString(),
      cards,
    }));
  } catch (error) {
    console.error('Failed to create safety backup:', error);
  }
}

export function getSafetyBackup(): { createdAt: string; cards: Flashcard[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(SAFETY_BACKUP_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { createdAt?: unknown; cards?: unknown };
    const validated = validateImportData(parsed.cards);
    if (!validated.isValid || typeof parsed.createdAt !== 'string') return null;
    return { createdAt: parsed.createdAt, cards: validated.cards };
  } catch {
    return null;
  }
}

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
