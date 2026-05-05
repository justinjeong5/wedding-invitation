"use client";

import { useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useDragControls,
  animate,
  type PanInfo,
} from "framer-motion";
import { useKakaoMap } from "@/hooks/useKakaoMap";

const DISMISS_VELOCITY = 500;
const DISMISS_RATIO = 0.35;

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
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useKakaoMap(mapRef, { lat, lng, name, interactive: true });

  const screenHeight = window.innerHeight;
  const sheetHeight = screenHeight * 0.85;
  const y = useMotionValue(screenHeight);
  const dragControls = useDragControls();
  const backdropOpacity = useTransform(y, [0, screenHeight], [0.5, 0]);

  const handleDismiss = useCallback(() => {
    animate(y, screenHeight, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      onComplete: () => onCloseRef.current(),
    });
  }, [y, screenHeight]);

  // Entry animation
  useEffect(() => {
    animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
  }, [y]);

  // iOS Safari body scroll lock
  useEffect(() => {
    const scrollY = window.scrollY;
    const { style } = document.body;

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      style.overflow = "";
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, []);

  // Esc key + initial focus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleDismiss]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const currentY = y.get();
    const shouldDismiss =
      currentY > sheetHeight * DISMISS_RATIO ||
      info.velocity.y > DISMISS_VELOCITY;

    if (shouldDismiss) {
      handleDismiss();
    } else {
      animate(y, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  };

  return createPortal(
    <>
      {/* 배경 오버레이 — y motionValue에 연동 */}
      <motion.div
        className="fixed inset-0 z-[60] bg-black"
        style={{ opacity: backdropOpacity }}
        onClick={handleDismiss}
      />

      {/* 바텀시트 — drag는 시트에, dragListener off + dragControls로 헤더에서만 시작 */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-[61] flex flex-col h-[85dvh] max-w-[480px] mx-auto bg-bg-card rounded-t-2xl overflow-hidden shadow-2xl"
        style={{ y }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.05, bottom: 0 }}
        onDragEnd={handleDragEnd}
        role="dialog"
        aria-modal="true"
        aria-label={`${name} 지도`}
      >
        {/* 드래그 핸들 + 헤더 (이 영역에서만 드래그 시작) */}
        <div
          className="cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="flex items-center justify-between px-5 py-2">
            <p className="text-sm tracking-[0.08em] text-text font-medium">
              {name}
            </p>
            <button
              ref={closeBtnRef}
              onClick={handleDismiss}
              onPointerDown={(e) => e.stopPropagation()}
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
        </div>

        {/* 인터랙티브 지도 (드래그 전파 차단) */}
        <div
          className="flex-1 min-h-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </motion.div>
    </>,
    document.body
  );
}
