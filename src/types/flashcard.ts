export type DomainCategory =
  | 'Domain 1: Security Principles'
  | 'Domain 2: Security Governance'
  | 'Domain 3: Identity and Access Management (IAM) Concepts'
  | 'Domain 4: Networking and Cloud Security Concepts'
  | 'Domain 5: Security Operations and Incident Response';

export const DOMAIN_OPTIONS: DomainCategory[] = [
  'Domain 1: Security Principles',
  'Domain 2: Security Governance',
  'Domain 3: Identity and Access Management (IAM) Concepts',
  'Domain 4: Networking and Cloud Security Concepts',
  'Domain 5: Security Operations and Incident Response',
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
