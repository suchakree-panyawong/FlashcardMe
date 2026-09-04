﻿/**
 * Web Speech API helper — selects the most natural-sounding English voice available.
 *
 * Voice priority (Chrome/Edge desktop):
 *  1. "Google US English"      — online neural voice (Chrome)
 *  2. "Microsoft Aria Online"  — online neural voice (Edge)
 *  3. Any voice name contains "Natural"
 *  4. Any en-US non-local voice (cloud-backed)
 *  5. Any en-US local voice
 *  6. Fallback: browser default
 */

let _cachedEnVoice: SpeechSynthesisVoice | null = null;
let _cachedThVoice: SpeechSynthesisVoice | null = null;
let _voicesLoaded = false;

function pickBestVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (lang === 'en-US') {
    return (
      voices.find(v => v.name === 'Google US English') ||
      voices.find(v => v.name.includes('Microsoft Aria Online')) ||
      voices.find(v => v.name.includes('Microsoft Aria')) ||
      voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
      voices.find(v => v.lang === 'en-US' && !v.localService) ||
      voices.find(v => v.lang.startsWith('en') && !v.localService) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    );
  }
  if (lang === 'th-TH') {
    return (
      voices.find(v => v.lang === 'th-TH' && v.name.includes('Google')) ||
      voices.find(v => v.lang === 'th-TH' && !v.localService) ||
      voices.find(v => v.lang === 'th-TH') ||
      null
    );
  }
  return null;
}

function loadVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  _cachedEnVoice = pickBestVoice(voices, 'en-US');
  _cachedThVoice = pickBestVoice(voices, 'th-TH');
  _voicesLoaded = true;
}

// Load voices as soon as possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Returns the best available English voice, waiting for voices to load if needed.
 */
export async function getBestEnglishVoice(): Promise<SpeechSynthesisVoice | null> {
  if (_voicesLoaded || typeof window === 'undefined') return _cachedEnVoice;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(_cachedEnVoice), 2000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      loadVoices();
      resolve(_cachedEnVoice);
    };
    // Try now in case they're already available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      clearTimeout(timeout);
      loadVoices();
      resolve(_cachedEnVoice);
    }
  });
}

export function getBestThaiVoice(): SpeechSynthesisVoice | null {
  return _cachedThVoice;
}

/**
 * Speaks a single English word/phrase using the best available voice.
 * Applies subtle pitch/rate variation to sound more natural.
 */
export function speakText(text: string, lang: string = 'en-US'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;

  if (lang === 'en-US') {
    utt.voice = _cachedEnVoice;
    // Natural-sounding settings: slightly varied rate and pitch
    utt.rate = 0.88;
    utt.pitch = 1.05;
    utt.volume = 1;
  } else if (lang === 'th-TH') {
    utt.voice = _cachedThVoice;
    utt.rate = 0.82;
    utt.pitch = 1.0;
    utt.volume = 1;
  }

  window.speechSynthesis.speak(utt);
}

/**
 * Speaks a flashcard in sequence:
 *   "[English vocab]... แปลว่า... [Thai meaning]"
 *
 * Returns a Promise that resolves when the full sequence is done.
 */
export function speakFlashcard(
  vocab: string,
  thaiMeaning: string,
  speed: number = 0.88,
  muted: boolean = false,
  cancelled: { current: boolean } = { current: false }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || muted) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Add punctuation to trigger natural prosody pauses
    const parts: { text: string; lang: string; rate: number; pitch: number; pauseMs: number }[] = [
      { text: vocab + '.', lang: 'en-US', rate: speed, pitch: 1.05, pauseMs: 650 },
      { text: thaiMeaning + '.', lang: 'th-TH', rate: 0.82, pitch: 1.0, pauseMs: 1200 },
    ];

    let i = 0;

    function next() {
      if (cancelled.current || i >= parts.length) {
        resolve();
        return;
      }
      const { text, lang, rate, pitch, pauseMs } = parts[i];
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      utt.rate = rate;
      utt.pitch = pitch;
      utt.volume = 1;

      if (lang === 'en-US') utt.voice = _cachedEnVoice;
      else if (lang === 'th-TH') utt.voice = _cachedThVoice;

      utt.onend = () => {
        i++;
        setTimeout(next, pauseMs);
      };
      utt.onerror = () => {
        i++;
        next();
      };

      window.speechSynthesis.speak(utt);
    }

    next();
  });
}
