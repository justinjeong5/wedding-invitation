"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";

const STORAGE_KEY = "bgm-pref";

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptReady, setPromptReady] = useState(false);
  const wasPlayingBeforeHidden = useRef(false);

  // Audio 초기화 (재생하지 않음)
  useEffect(() => {
    const audio = new Audio(WEDDING_CONFIG.bgm.src);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    audio.addEventListener("error", () => setHasError(true));

    // 이전 선택 확인
    const pref = localStorage.getItem(STORAGE_KEY);
    if (pref === "play") {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else if (pref === null) {
      // 첫 방문 — 프롬프트 표시 (커버 애니메이션 후)
      const timer = setTimeout(() => {
        setShowPrompt(true);
        setPromptReady(true);
      }, 1800);
      return () => {
        clearTimeout(timer);
        audio.pause();
        audio.src = "";
      };
    }
    // pref === "mute" → 아무것도 안 함

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 백그라운드 전환 시 일시정지
  useEffect(() => {
    const handleVisibility = () => {
      if (!audioRef.current) return;
      if (document.hidden) {
        wasPlayingBeforeHidden.current = isPlaying;
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        if (wasPlayingBeforeHidden.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  // 스크롤 잠금 (프롬프트 표시 중)
  useEffect(() => {
    if (showPrompt) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showPrompt]);

  // 관리자 모드 토글
  useEffect(() => {
    const handler = (e: Event) => {
      const { enabled } = (e as CustomEvent).detail;
      if (enabled && audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else if (!enabled && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("bgm-toggle", handler);
    return () => window.removeEventListener("bgm-toggle", handler);
  }, []);

  const handlePromptChoice = useCallback((play: boolean) => {
    localStorage.setItem(STORAGE_KEY, play ? "play" : "mute");
    if (play && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setShowPrompt(false);
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  if (hasError) return null;

  return (
    <>
      {/* BGM 프롬프트 오버레이 */}
      <AnimatePresence>
        {showPrompt && promptReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center text-white px-6"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 mx-auto mb-4 opacity-80"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
              <p className="text-sm font-light tracking-wide leading-relaxed mb-6 opacity-90">
                잔잔한 음악과 함께<br />보시겠어요?
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => handlePromptChoice(true)}
                  className="px-8 py-2.5 text-sm tracking-wider border border-white/60 rounded-full text-white hover:bg-white/10 transition-colors"
                  style={{ minHeight: "auto" }}
                >
                  ♪ 음악과 함께
                </button>
                <button
                  onClick={() => handlePromptChoice(false)}
                  className="text-xs text-white/50 underline underline-offset-4 decoration-white/30 hover:text-white/70 transition-colors"
                  style={{ minHeight: "auto" }}
                >
                  조용히 볼게요
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 토글 버튼 */}
      <button
        onClick={toggle}
        className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-primary active:scale-95 transition-transform"
        style={{ minHeight: "auto" }}
        aria-label={isPlaying ? "음악 끄기" : "음악 켜기"}
        title={isPlaying ? "음악 끄기" : "음악 켜기"}
      >
        <svg
          viewBox="0 0 24 24"
          className={`w-5 h-5 ${isPlaying ? "animate-spin" : ""}`}
          style={isPlaying ? { animationDuration: "3s" } : undefined}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
        </svg>
      </button>
    </>
  );
}
