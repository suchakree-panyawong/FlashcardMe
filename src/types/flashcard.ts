export type DomainCategory = 'Security Principles' | 'Business Continuity, Disaster Recovery & Risk Management' | 'Access Controls' | 'Network Security' | 'Security Operations';

export const DOMAIN_OPTIONS: DomainCategory[] = [
  'Security Principles',
  'Business Continuity, Disaster Recovery & Risk Management',
  'Access Controls',
  'Network Security',
  'Security Operations',
];

export type CardCategory = 'general' | 'cert';

export interface Flashcard {
  category?: CardCategory;
  id: string;
  vocab: string;
  vocabThai?: string;
  meaning: string;
  domain: DomainCategory | string;
  pattern: string;
  scenario: string;
  nextReviewDate: string;
  interval: number;
  createdAt?: string;
  isFavorite?: boolean; // ✨ NEW: Favorite / Bookmark Option
}

export type ReviewRating = 'hard' | 'good' | 'easy';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

export interface UserStreak {
  currentStreak: number;
  lastStudyDate: string;
  totalReviews: number;
}
