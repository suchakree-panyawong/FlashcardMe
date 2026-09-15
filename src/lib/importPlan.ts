import { Flashcard } from '@/types/flashcard';
import { areDuplicateWords } from '@/lib/duplicateWords';

export interface ImportPlan {
  cards: Flashcard[];
  added: Flashcard[];
  updated: Flashcard[];
  skipped: Flashcard[];
  items: ImportPlanItem[];
}

export type ImportAction = 'add' | 'update' | 'skip';

export interface ImportPlanItem {
  card: Flashcard;
  action: ImportAction;
  reason: 'new' | 'id-match' | 'duplicate-word';
}

export function buildImportPlan(
  existingCards: Flashcard[],
  importedCards: Flashcard[],
  decisions: Record<string, ImportAction> = {},
): ImportPlan {
  const cardsById = new Map(existingCards.map((card) => [card.id, card]));
  const added: Flashcard[] = [];
  const updated: Flashcard[] = [];
  const skipped: Flashcard[] = [];
  const items: ImportPlanItem[] = [];

  importedCards.forEach((card) => {
    if (cardsById.has(card.id)) {
      const action = decisions[card.id] ?? 'update';
      items.push({ card, action, reason: 'id-match' });
      if (action === 'update') {
        cardsById.set(card.id, card);
        updated.push(card);
      } else if (action === 'add') {
        const addedCard = { ...card, id: `${card.id}-imported-${Date.now()}-${items.length}` };
        cardsById.set(addedCard.id, addedCard);
        added.push(addedCard);
      } else {
        skipped.push(card);
      }
      return;
    }

    const duplicateWord = Array.from(cardsById.values()).some((existingCard) =>
      areDuplicateWords(existingCard.vocab, card.vocab)
    );
    const reason = duplicateWord ? 'duplicate-word' : 'new';
    const action = decisions[card.id] ?? (duplicateWord ? 'skip' : 'add');
    items.push({ card, action, reason });
    if (action === 'add') {
      cardsById.set(card.id, card);
      added.push(card);
    } else if (action === 'update') {
      const matchingCard = Array.from(cardsById.values()).find((existingCard) => areDuplicateWords(existingCard.vocab, card.vocab));
      if (matchingCard) {
        cardsById.set(matchingCard.id, card);
        updated.push(card);
      } else {
        cardsById.set(card.id, card);
        added.push(card);
      }
    } else {
      skipped.push(card);
    }
  });

  return { cards: Array.from(cardsById.values()), added, updated, skipped, items };
}