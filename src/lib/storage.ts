import { Flashcard, StudyStats } from '@/types/flashcard';
import { validateImportData } from '@/lib/security';

const STORAGE_KEY = 'flashcardme_cards_v8';
const SAFETY_BACKUP_KEY = 'flashcardme_safety_backup_v1';
const STUDY_STATS_KEY = 'flashcardme_study_stats_v1';
const STUDY_SESSION_KEY = 'flashcardme_study_session_v1';
const LEGACY_STARTER_CARDS = [
  ['public-gen-001', 'Resilience'],
  ['public-gen-002', 'Synchronize'],
  ['public-gen-003', 'Efficiency'],
  ['public-gen-004', 'Benchmark'],
  ['public-gen-005', 'Vulnerability'],
] as const;

export interface StudySession {
  mode: 'general' | 'cert';
  cardIds: string[];
  retryCards?: Flashcard[];
  promptDirections?: Record<string, boolean>;
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
      retryCards: Array.isArray(parsed.retryCards) ? parsed.retryCards as Flashcard[] : [],
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
  dailyGoal: 10,
  dailyReviews: {},
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
      dailyGoal: typeof parsed.dailyGoal === 'number' && parsed.dailyGoal > 0 ? parsed.dailyGoal : 10,
      dailyReviews: parsed.dailyReviews && typeof parsed.dailyReviews === 'object' ? parsed.dailyReviews as Record<string, number> : {},
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
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      const validated = validateImportData(parsed);
      if (validated.isValid) {
        const cards = validated.cards;
        const isLegacyStarterDeck = cards.length === LEGACY_STARTER_CARDS.length
          && LEGACY_STARTER_CARDS.every(([id, vocab]) =>
            cards.some((card) => card.id === id && card.vocab === vocab)
          );
        const storedCards = isLegacyStarterDeck ? [] : cards;
        if (isLegacyStarterDeck) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCards));
        }
        return storedCards;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (error) {
    console.error('Failed to load flashcards:', error);
    return [];
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

export function clearStoredFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
