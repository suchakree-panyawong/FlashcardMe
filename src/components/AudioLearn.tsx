"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack,
  Shuffle, Repeat, Volume2, VolumeX,
  ChevronUp, Headphones, BookOpen, Repeat1,
  ListMusic, X,
} from "lucide-react";
import { Flashcard, CardCategory } from "@/types/flashcard";
import { speakFlashcard, getBestEnglishVoice } from "@/lib/speech";

interface AudioLearnProps {
  cards: Flashcard[];
  activeMode: CardCategory;
}

type PlayMode = "loop" | "once" | "shuffle" | "loop1";

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0] as const;
type Speed = typeof SPEEDS[number];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DOMAIN_COLORS: Record<string, string> = {
  "Security Principles": "from-violet-600 to-indigo-700",
  "Business Continuity, Disaster Recovery & Risk Management": "from-rose-600 to-pink-700",
  "Access Controls": "from-emerald-600 to-teal-700",
  "Network Security": "from-sky-600 to-blue-700",
  "Security Operations": "from-amber-600 to-orange-700",
  "General Vocab": "from-purple-600 to-violet-700",
  default: "from-indigo-600 to-purple-700",
};

function getDomainGradient(domain: string): string {
  return DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.default;
}

export const AudioLearn: React.FC<AudioLearnProps> = ({ cards, activeMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>("loop");
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1.0);
  const [playlist, setPlaylist] = useState<Flashcard[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [voiceName, setVoiceName] = useState<string>("");

  const cancelRef = useRef({ current: false });

  useEffect(() => {
    getBestEnglishVoice().then((v) => { if (v) setVoiceName(v.name); });
  }, []);

  useEffect(() => {
    const filtered = cards.filter((c) => (c.category ?? "general") === activeMode);
    setPlaylist(filtered);
    setCurrentIndex(0);
    setIsFinished(false);
  }, [cards, activeMode]);

  const currentCard = playlist[currentIndex] ?? null;
  const gradient = getDomainGradient(currentCard?.domain ?? "");

  const stopSpeech = useCallback(() => {
    cancelRef.current.current = true;
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
  }, []);

  const runPlayback = useCallback(
    async (startIdx: number, pl: Flashcard[], mode: PlayMode, spd: number, muted: boolean) => {
      const cancelled = { current: false };
      cancelRef.current = cancelled;
      let idx = startIdx;

      while (!cancelled.current) {
        if (idx >= pl.length) {
          if (mode === "loop") { idx = 0; }
          else { setIsFinished(true); setIsPlaying(false); return; }
        }
        setCurrentIndex(idx);
        const card = pl[idx];
        const thai = card.vocabThai ?? card.meaning.split("(")[0].trim().slice(0, 60);
        await speakFlashcard(card.vocab, thai, spd * 0.88, muted, cancelled);
        if (cancelled.current) break;
        if (mode === "loop1") { /* repeat same */ }
        else idx++;
      }
      setIsPlaying(false);
    },
    []
  );

  const handlePlay = useCallback(() => {
    setIsFinished(false);
    let pl = playlist;
    let startIdx = currentIndex;
    if (playMode === "shuffle") {
      pl = shuffleArray(playlist); setPlaylist(pl); startIdx = 0; setCurrentIndex(0);
    }
    setIsPlaying(true);
    runPlayback(startIdx, pl, playMode, speed, isMuted);
  }, [playlist, currentIndex, playMode, speed, isMuted, runPlayback]);

  const handlePause = useCallback(() => { stopSpeech(); setIsPlaying(false); }, [stopSpeech]);

  const go = useCallback((next: number) => {
    const wasPlaying = isPlaying;
    stopSpeech(); setIsPlaying(false);
    const idx = ((next % playlist.length) + playlist.length) % playlist.length;
    setCurrentIndex(idx);
    setIsFinished(false);
    if (wasPlaying) setTimeout(() => { setIsPlaying(true); runPlayback(idx, playlist, playMode, speed, isMuted); }, 120);
  }, [isPlaying, playlist, playMode, speed, isMuted, stopSpeech, runPlayback]);

  const cycleMode = () => {
    const modes: PlayMode[] = ["loop", "once", "shuffle", "loop1"];
    setPlayMode(modes[(modes.indexOf(playMode) + 1) % modes.length]);
  };

  useEffect(() => () => { cancelRef.current.current = true; if (typeof window !== "undefined") window.speechSynthesis.cancel(); }, []);

  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
        <div className="flex h-28 w-40 items-center justify-center">
          <img src="/cat-listening-Photoroom.png" alt="แมวกำลังฟังเสียง" className="h-full w-full object-contain" />
        </div>
        <p className="text-slate-500 font-semibold thai-text">ไม่มีการ์ดสำหรับ mode นี้</p>
      </div>
    );
  }

  const modeConfig = {
    loop: { icon: <Repeat className="w-4 h-4" />, label: "Loop All", color: "text-indigo-400" },
    once: { icon: <BookOpen className="w-4 h-4" />, label: "Play Once", color: "text-slate-400" },
    shuffle: { icon: <Shuffle className="w-4 h-4" />, label: "Shuffle", color: "text-amber-400" },
    loop1: { icon: <Repeat1 className="w-4 h-4" />, label: "Loop One", color: "text-emerald-400" },
  };

  const progress = ((currentIndex + 1) / playlist.length) * 100;

  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)] -mx-4 -mt-4">

      {/* ── HERO PLAYER ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative bg-gradient-to-br ${gradient} px-6 pt-10 pb-8 overflow-hidden`}
        >
          {/* Background blobs */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-3xl pointer-events-none"
          />

          {/* Domain badge */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              {currentCard?.domain ?? "General"}
            </span>
            <button onClick={() => setShowPlaylist(v => !v)}
              className="flex items-center space-x-1.5 text-white/70 hover:text-white transition-colors text-[11px] font-bold">
              <ListMusic className="w-4 h-4" />
              <span>{playlist.length} คำ</span>
            </button>
          </div>

          {/* Main word display */}
          <div className="text-center space-y-3 relative z-10 py-4">
            {/* Animated icon */}
            <div className="flex justify-center mb-2">
              <motion.div
                animate={isPlaying ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="flex h-24 w-32 items-center justify-center rounded-2xl bg-white/10 px-1 backdrop-blur-sm border border-white/20 shadow-xl sm:h-28 sm:w-40"
              >
                <img
                  src="/cat-listening-Photoroom.png"
                  alt="แมวกำลังฟังเสียง"
                  className={`h-full w-full object-contain ${isPlaying ? "drop-shadow-[0_0_14px_rgba(255,255,255,0.55)]" : "opacity-90"}`}
                />
              </motion.div>
            </div>

            <motion.h2
              key={currentCard?.vocab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg"
            >
              {currentCard?.vocab}
            </motion.h2>

            <motion.div
              key={currentCard?.vocabThai}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="space-y-1"
            >
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">แปลว่า</p>
              <p className="text-2xl font-black text-white/90 thai-text">
                {currentCard?.vocabThai ?? currentCard?.meaning.split("(")[0].trim().slice(0, 40)}
              </p>
            </motion.div>
          </div>

          {/* Waveform bars */}
          <div className="flex justify-center items-end space-x-1 h-8 relative z-10 mt-4">
            {Array.from({ length: 28 }).map((_, i) => {
              const h = isPlaying ? undefined : 4 + Math.sin(i * 0.8) * 8;
              return (
                <motion.div
                  key={i}
                  className="w-1 bg-white/40 rounded-full"
                  animate={isPlaying ? {
                    height: [
                      4 + Math.random() * 20,
                      8 + Math.random() * 20,
                      4 + Math.random() * 16,
                    ],
                  } : { height: h ?? 4 }}
                  transition={isPlaying ? {
                    repeat: Infinity,
                    duration: 0.5 + (i % 5) * 0.12,
                    ease: "easeInOut",
                    delay: i * 0.03,
                  } : { duration: 0.3 }}
                />
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-1.5 relative z-10">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/50">
              <span>{currentIndex + 1} / {playlist.length}</span>
              <span className="thai-text">{isFinished ? "จบแล้ว 🎉" : currentCard?.domain}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── CONTROLS ──────────────────────────────────────────────── */}
      <div className="bg-[#0f0f14] flex-1 px-6 pt-6 pb-4 space-y-6">

        {/* Voice info */}
        {voiceName && (
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">
              {voiceName}
            </span>
          </div>
        )}

        {/* Main transport */}
        <div className="flex items-center justify-center space-x-6">
          {/* Mode */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={cycleMode}
            className={`${modeConfig[playMode].color} transition-colors`}>
            {modeConfig[playMode].icon}
          </motion.button>

          {/* Prev */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => go(currentIndex - 1)}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all">
            <SkipBack className="w-6 h-6" />
          </motion.button>

          {/* Play/Pause — hero button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            onClick={isPlaying ? handlePause : handlePlay}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-white/10 transition-all"
          >
            {isPlaying
              ? <Pause className="w-9 h-9 text-[#0f0f14]" />
              : <Play className="w-9 h-9 text-[#0f0f14] ml-1" />
            }
          </motion.button>

          {/* Next */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => go(currentIndex + 1)}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all">
            <SkipForward className="w-6 h-6" />
          </motion.button>

          {/* Mute */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setIsMuted(v => !v)}
            className={`transition-colors ${isMuted ? "text-rose-400" : "text-slate-500"}`}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Speed selector */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">ความเร็ว</p>
          <div className="flex items-center justify-center space-x-2">
            {SPEEDS.map(s => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  speed === s
                    ? "bg-white text-[#0f0f14] border-white shadow-lg"
                    : "bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {s}×
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mode label */}
        <div className="flex justify-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${modeConfig[playMode].color}`}>
            {modeConfig[playMode].label}
          </span>
        </div>
      </div>

      {/* ── PLAYLIST DRAWER ───────────────────────────────────────── */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0f0f14] pt-safe"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <ListMusic className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-black text-white">Playlist</span>
                <span className="text-xs font-bold text-slate-500">({playlist.length} คำ)</span>
              </div>
              <button onClick={() => setShowPlaylist(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {playlist.map((card, i) => (
                <button key={card.id}
                  onClick={() => { stopSpeech(); setCurrentIndex(i); setIsFinished(false); setIsPlaying(false); setShowPlaylist(false); }}
                  className={`w-full flex items-center space-x-4 px-5 py-3.5 text-left transition-colors ${
                    i === currentIndex ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className={`text-xs font-black w-6 shrink-0 ${i === currentIndex ? "text-indigo-400" : "text-slate-600"}`}>
                    {i + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getDomainGradient(card.domain)} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-black text-white">{card.vocab[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${i === currentIndex ? "text-white" : "text-slate-300"}`}>
                      {card.vocab}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate thai-text">
                      {card.vocabThai ?? card.meaning.slice(0, 35)}
                    </p>
                  </div>
                  {i === currentIndex && isPlaying && (
                    <div className="flex items-end space-x-0.5 shrink-0">
                      {[1, 0.6, 1, 0.4].map((h, j) => (
                        <motion.div key={j} className="w-1 bg-indigo-400 rounded-full"
                          animate={{ scaleY: [h, 1, h] }} transition={{ repeat: Infinity, duration: 0.7, delay: j * 0.15 }}
                          style={{ height: "12px", originY: 1 }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finished overlay */}
      <AnimatePresence>
        {isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0f0f14]/90 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1a24] border border-white/10 rounded-3xl p-8 mx-8 text-center space-y-5 shadow-2xl">
              <div className="text-6xl">🎉</div>
              <div className="space-y-1">
                <p className="text-xl font-black text-white">จบแล้ว!</p>
                <p className="text-sm text-slate-400 thai-text">ฟังครบ {playlist.length} คำแล้ว</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => { setCurrentIndex(0); setIsFinished(false); }}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/15 transition-colors thai-text">
                  ฟังอีกครั้ง
                </button>
                <button onClick={() => { setCurrentIndex(0); setIsFinished(false); handlePlay(); }}
                  className="flex-1 py-3 rounded-2xl bg-white text-[#0f0f14] font-black text-sm thai-text">
                  เล่นใหม่
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
