import { Flashcard } from '@/types/flashcard';

export function calculateNextReview(card: Flashcard, rating: 'hard' | 'good' | 'easy'): { nextReviewDate: string; interval: number } {
  const now = new Date();
  let daysToAdd = 1;
  let newInterval = 1;

  if (rating === 'hard') {
    // Review Tomorrow
    daysToAdd = 1;
    newInterval = 1;
  } else if (rating === 'good') {
    // Review in 3 Days (or current interval * 1.5 rounded up, min 3)
    daysToAdd = Math.max(3, Math.round((card.interval || 1) * 1.5));
    newInterval = daysToAdd;
  } else if (rating === 'easy') {
    // Review in 7 Days (or current interval * 2.5 rounded up, min 7)
    daysToAdd = Math.max(7, Math.round((card.interval || 1) * 2.5));
    newInterval = daysToAdd;
  }

  const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  return {
    nextReviewDate: nextDate.toISOString(),
    interval: newInterval,
  };
}

export function isDueToday(nextReviewDateStr: string): boolean {
  if (!nextReviewDateStr) return true;
  const reviewDate = new Date(nextReviewDateStr);
  const now = new Date();
  // If review date is today or in the past
  return reviewDate <= now;
}
