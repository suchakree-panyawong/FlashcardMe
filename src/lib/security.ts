import { Flashcard } from '@/types/flashcard';

export function sanitizeText(str: string): string {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MOJIBAKE_MARKERS = ['Ã', 'Â', 'â', 'ð', '�', 'à¸', 'à¹'];

const CP1252_BYTES: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x192: 0x83, 0x201e: 0x84,
  0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x2c6: 0x88,
  0x2030: 0x89, 0x160: 0x8a, 0x2039: 0x8b, 0x152: 0x8c,
  0x17d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
  0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x2dc: 0x98, 0x2122: 0x99, 0x161: 0x9a, 0x203a: 0x9b,
  0x153: 0x9c, 0x17e: 0x9e, 0x178: 0x9f,
};

function mojibakeScore(value: string): number {
  return MOJIBAKE_MARKERS.reduce((score, marker) => score + value.split(marker).length - 1, 0);
}

function repairMojibake(value: string): string {
  let repaired = value;

  for (let pass = 0; pass < 4; pass += 1) {
    if (mojibakeScore(repaired) === 0) break;

    try {
      const bytes = new Uint8Array(Array.from(repaired).map((character) => {
        const codePoint = character.codePointAt(0) ?? 0;
        return codePoint <= 0xff ? codePoint : CP1252_BYTES[codePoint] ?? 0;
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
