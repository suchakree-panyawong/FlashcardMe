import { Flashcard } from '@/types/flashcard';

export function sanitizeText(str: string): string {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    const { id, vocab, vocabThai, meaning, domain, pattern, scenario, nextReviewDate, interval, createdAt } = item as Record<string, any>;

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
      vocab: vocab.trim(),
      vocabThai: typeof vocabThai === 'string' ? vocabThai.trim() : '',
      meaning: meaning.trim(),
      domain: typeof domain === 'string' ? domain : 'Security Principles',
      pattern: typeof pattern === 'string' ? pattern : '',
      scenario: typeof scenario === 'string' ? scenario : '',
      nextReviewDate: typeof nextReviewDate === 'string' ? nextReviewDate : new Date().toISOString(),
      interval: typeof interval === 'number' && interval > 0 ? interval : 1,
      createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    });
  }

  return { isValid: true, cards: validCards };
}
