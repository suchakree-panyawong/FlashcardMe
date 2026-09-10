import { Flashcard } from '@/types/flashcard';

export function sanitizeText(str: string): string {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MOJIBAKE_MARKERS = ['Ã', 'Â', 'â', 'ð', '�'];

function mojibakeScore(value: string): number {
  return MOJIBAKE_MARKERS.reduce((score, marker) => score + value.split(marker).length - 1, 0);
}

function repairMojibake(value: string): string {
  let repaired = value;

  for (let pass = 0; pass < 2; pass += 1) {
    if (mojibakeScore(repaired) === 0) break;

    try {
      const bytes = new Uint8Array(repaired.split('').map((character) => {
        const codePoint = character.codePointAt(0) ?? 0;
        return codePoint <= 0xff ? codePoint : 0;
      }));
      const candidate = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (mojibakeScore(candidate) >= mojibakeScore(repaired)) break;
      repaired = candidate;
    } catch {
      break;
    }
  }

  return repaired;
}

export function validateImportData(data: unknown): { isValid: boolean; cards: Flashcard[]; error?: string } {
  if (!Array.isArray(data)) {
    return { isValid: false, cards: [], error: 'ข้อมูล JSON ต้องเป็น Array ของ Flashcard' };
  }
  if (data.length > 1000) {
    return { isValid: false, cards: [], error: 'ไฟล์มีการ์ดมากเกินไป (สูงสุด 1,000 ใบ)' };
  }

  const validCards: Flashcard[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item || typeof item !== 'object') {
      return { isValid: false, cards: [], error: 'รายการลำดับที่ ' + i + ' ไม่ใช่วัตถุข้อมูลที่ถูกต้อง' };
    }

    const { id, vocab, vocabThai, meaning, domain, pattern, scenario, nextReviewDate, interval, createdAt, category, isFavorite, reviewCount, correctCount, incorrectCount } = item as Record<string, any>;

    if (typeof vocab !== 'string' || !vocab.trim() || vocab.length > 200) {
      return { isValid: false, cards: [], error: 'คำศัพท์ในลำดับที่ ' + i + ' ไม่ถูกต้อง' };
    }

    if (typeof meaning !== 'string' || !meaning.trim() || meaning.length > 5000) {
      return { isValid: false, cards: [], error: 'คำอธิบายในลำดับที่ ' + i + ' ไม่ถูกต้อง' };
    }

    if (
      (typeof nextReviewDate === 'string' && Number.isNaN(Date.parse(nextReviewDate))) ||
      (typeof createdAt === 'string' && Number.isNaN(Date.parse(createdAt))) ||
      (typeof interval === 'number' && (!Number.isFinite(interval) || interval <= 0 || interval > 36500))
    ) {
      return { isValid: false, cards: [], error: 'ข้อมูลวันที่หรือรอบทบทวนในลำดับที่ ' + i + ' ไม่ถูกต้อง' };
    }

    validCards.push({
      id: typeof id === 'string' && id.trim() ? id : 'card-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      vocab: repairMojibake(vocab.trim()),
      vocabThai: typeof vocabThai === 'string' ? repairMojibake(vocabThai.trim()) : '',
      meaning: repairMojibake(meaning.trim()),
      domain: typeof domain === 'string' && domain.trim() ? repairMojibake(domain.trim()) : 'Domain 1: Security Principles',
      pattern: typeof pattern === 'string' ? repairMojibake(pattern) : '',
      scenario: typeof scenario === 'string' ? repairMojibake(scenario) : '',
      nextReviewDate: typeof nextReviewDate === 'string' ? nextReviewDate : new Date().toISOString(),
      interval: typeof interval === 'number' && interval > 0 ? interval : 1,
      createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
      category: category === 'cert' || category === 'general'
        ? category
        : typeof domain === 'string' && domain !== 'General Vocab'
          ? 'cert'
          : 'general',
          isFavorite: isFavorite === true,
          reviewCount: typeof reviewCount === 'number' && reviewCount >= 0 ? Math.floor(reviewCount) : 0,
          correctCount: typeof correctCount === 'number' && correctCount >= 0 ? Math.floor(correctCount) : 0,
          incorrectCount: typeof incorrectCount === 'number' && incorrectCount >= 0 ? Math.floor(incorrectCount) : 0,
    });
  }

  return { isValid: true, cards: validCards };
}
