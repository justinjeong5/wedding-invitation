"use client";

import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useKakaoMap } from "@/hooks/useKakaoMap";

interface KakaoMapModalProps {
  lat: number;
  lng: number;
  name: string;
  onClose: () => void;
}

export default function KakaoMapModal({
  lat,
  lng,
  name,
  onClose,
}: KakaoMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useKakaoMap(mapRef, { lat, lng, name, interactive: true });

  // iOS Safari body scroll lock
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Esc 키 닫기 + 초기 포커스
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <>
      {/* 배경 오버레이 */}
      <motion.div
        className="fixed inset-0 z-[60] bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* 모달 */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-[61] flex flex-col h-[85dvh] max-w-[480px] mx-auto bg-bg-card rounded-t-2xl overflow-hidden shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`${name} 지도`}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-2">
          <p className="font-serif text-sm tracking-[0.08em] text-text">
            {name}
          </p>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted active:bg-border/60 transition-colors"
            style={{ minHeight: "auto" }}
            aria-label="닫기"
            type="button"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4.5 h-4.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5l10 10M15 5L5 15"
              />
            </svg>
          </button>
        </div>

        {/* 인터랙티브 지도 */}
        <div className="flex-1 min-h-0">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </motion.div>
    </>,
    document.body
  );
}
