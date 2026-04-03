"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasInteracted = useRef(false);

  // Audio 초기화
  useEffect(() => {
    const audio = new Audio(WEDDING_CONFIG.bgm.src);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    audio.addEventListener("error", () => setHasError(true));

    // 자동 재생 시도
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // 자동 재생 실패 - 사용자 인터랙션 대기
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 첫 터치 시 자동 재생 (자동 재생 실패했을 때)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (hasInteracted.current || !audioRef.current) return;
      hasInteracted.current = true;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    };

    document.addEventListener("touchstart", handleFirstInteraction, { once: true });
    document.addEventListener("click", handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

  // 외부 토글 이벤트 수신 (관리자 모드)
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
  );
}
