import { Flashcard } from '@/types/flashcard';
import { areDuplicateWords } from '@/lib/duplicateWords';

export interface ImportPlan {
  cards: Flashcard[];
  added: Flashcard[];
  updated: Flashcard[];
  skipped: Flashcard[];
}

export function buildImportPlan(existingCards: Flashcard[], importedCards: Flashcard[]): ImportPlan {
  const cardsById = new Map(existingCards.map((card) => [card.id, card]));
  const added: Flashcard[] = [];
  const updated: Flashcard[] = [];
  const skipped: Flashcard[] = [];

  importedCards.forEach((card) => {
    if (cardsById.has(card.id)) {
      cardsById.set(card.id, card);
      updated.push(card);
      return;
    }

    const duplicateWord = Array.from(cardsById.values()).some((existingCard) =>
      areDuplicateWords(existingCard.vocab, card.vocab)
    );
    if (duplicateWord) {
      skipped.push(card);
      return;
    }

    cardsById.set(card.id, card);
    added.push(card);
  });

  return { cards: Array.from(cardsById.values()), added, updated, skipped };
}