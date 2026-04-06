"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { getImageUrl } from "@/features/guest-gallery/constants";
import { formatRelativeDate } from "@/lib/format";
import type { GuestPhoto } from "@/types";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.5 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0.5 }),
};

export default function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: GuestPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [bounce, setBounce] = useState<"left" | "right" | null>(null);
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const photo = photos[index];
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const dragRef = useRef<HTMLDivElement>(null);

  const paginate = useCallback(
    (dir: number) => {
      const next = index + dir;
      if (next < 0 || next >= photos.length) {
        setBounce(dir < 0 ? "left" : "right");
        setTimeout(() => setBounce(null), 400);
        return;
      }
      setDirection(dir);
      setIndex(next);
    },
    [index, photos.length]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, paginate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      paginate(touchDeltaX.current > 0 ? -1 : 1);
    }
  };

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 w-full h-[100dvh] z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <span className="text-sm">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center"
          style={{ minHeight: "auto" }}
          aria-label="닫기"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        ref={dragRef}
        className="flex-1 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate={
              bounce
                ? { x: bounce === "left" ? 30 : -30, opacity: 1 }
                : "center"
            }
            exit="exit"
            transition={
              bounce
                ? { type: "spring", stiffness: 500, damping: 30 }
                : { duration: 0.25, ease: "easeInOut" }
            }
            className="absolute inset-0"
          >
            {!loadedSet.has(index) && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <Image
              src={getImageUrl(photo.storage_path)}
              alt={photo.caption || `${photo.name}님의 사진`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
              onLoad={() => setLoadedSet(prev => new Set(prev).add(index))}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="px-4 py-3 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-sm font-medium">{photo.name}</p>
        {photo.caption && (
          <p className="text-white/70 text-xs mt-1">{photo.caption}</p>
        )}
        <p className="text-white/40 text-[10px] mt-1">
          {formatRelativeDate(photo.created_at)}
        </p>
      </div>
    </motion.div>
  );
}
