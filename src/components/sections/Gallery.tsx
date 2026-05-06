"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Keyboard, Virtual } from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { GalleryImage } from "@/types";

import "swiper/css";
import "swiper/css/virtual";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
};

function isCompositeRow(
  row: unknown
): row is { landscape: readonly number[]; portrait: number } {
  return typeof row === "object" && row !== null && "portrait" in row;
}

export default function Gallery() {
  const { images, layout } = WEDDING_CONFIG.gallery;
  const [isOpen, setIsOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [rotateHintOpen, setRotateHintOpen] = useState(false);
  const [edgeShake, setEdgeShake] = useState<"start" | "end" | null>(null);
  const [edgeShakeNonce, setEdgeShakeNonce] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);
  const navPointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const SWIPE_THRESHOLD = 35;
  const TAP_THRESHOLD = 10;

  const triggerEdgeShake = useCallback((edge: "start" | "end") => {
    setEdgeShake(null);
    setEdgeShakeNonce((n) => n + 1);
    requestAnimationFrame(() => setEdgeShake(edge));
    setTimeout(() => setEdgeShake(null), 500);
  }, []);

  const dismissRotateHint = useCallback(() => {
    setRotateHintOpen(false);
    try {
      localStorage.setItem("wjw-gallery-rotate-hint-seen", "1");
    } catch {}
  }, []);

  const openLightbox = useCallback((idx: number) => {
    setSlideIndex(idx);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const preventContextMenu = useCallback(
    (e: React.MouseEvent | React.SyntheticEvent) => {
      e.preventDefault();
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeLightbox]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setRotateHintOpen(false);
      return;
    }
    const current = images[slideIndex];
    if (!current) return;
    const isLandscape = current.width > current.height;
    if (!isLandscape) {
      setRotateHintOpen(false);
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem("wjw-gallery-rotate-hint-seen") === "1";
    } catch {}
    setRotateHintOpen(!seen);
  }, [isOpen, slideIndex, images]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const eagerSet = useMemo(
    () =>
      new Set<number>(
        layout
          .flatMap((row) =>
            isCompositeRow(row) ? [...row.landscape, row.portrait] : [...row]
          )
          .slice(0, 4)
      ),
    [layout]
  );

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.dataset.loaded = "true";
    },
    []
  );

  function renderImage(
    image: GalleryImage,
    idx: number,
    sizes: string,
    style?: React.CSSProperties
  ) {
    return (
      <div
        key={idx}
        className="gallery-item gallery-shimmer relative rounded-xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: `${image.width} / ${image.height}`, ...style }}
        onClick={() => openLightbox(idx)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="gallery-img object-cover"
          sizes={sizes}
          loading={eagerSet.has(idx) ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
          onContextMenu={preventContextMenu}
          draggable={false}
        />
      </div>
    );
  }

  function renderIntrinsicImage(
    image: GalleryImage,
    idx: number,
    sizes: string
  ) {
    return (
      <div
        key={idx}
        className="gallery-item gallery-shimmer relative rounded-xl overflow-hidden cursor-pointer"
        onClick={() => openLightbox(idx)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="gallery-img w-full h-auto"
          sizes={sizes}
          loading={eagerSet.has(idx) ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
          onContextMenu={preventContextMenu}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <>
      <SectionWrapper id="gallery" className="text-center">
        <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
          갤러리
        </h2>

        <div className="space-y-1.5">
          {layout.map((row, rowIdx) => {
            if (isCompositeRow(row)) {
              return (
                <div
                  key={rowIdx}
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: "9fr 9fr 8fr" }}
                >
                  {row.landscape.map((idx) =>
                    renderImage(images[idx], idx, "34vw")
                  )}
                  <div
                    key={row.portrait}
                    className="gallery-item gallery-shimmer relative rounded-xl overflow-hidden cursor-pointer"
                    style={{ gridColumn: 3, gridRow: "1 / 3" }}
                    onClick={() => openLightbox(row.portrait)}
                  >
                    <Image
                      src={images[row.portrait].src}
                      alt={images[row.portrait].alt}
                      fill
                      className="gallery-img object-cover"
                      sizes="32vw"
                      loading={eagerSet.has(row.portrait) ? "eager" : "lazy"}
                      onLoad={handleImageLoad}
                      onError={handleImageLoad}
                      onContextMenu={preventContextMenu}
                      draggable={false}
                    />
                  </div>
                </div>
              );
            }

            const gridRow = row as readonly number[];
            const sizes =
              gridRow.length === 1
                ? "(max-width: 480px) 100vw, 480px"
                : "50vw";

            return (
              <div
                key={rowIdx}
                className={`grid ${GRID_COLS[gridRow.length]} gap-1.5 items-start`}
              >
                {gridRow.map((idx) => renderIntrinsicImage(images[idx], idx, sizes))}
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full h-[100dvh] z-50 bg-black"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
          >
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-10 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white/70 text-sm">
                {slideIndex + 1} / {images.length}
              </span>
              <div className="flex items-center gap-1">
                {images[slideIndex].width > images[slideIndex].height && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRotateHintOpen(true);
                    }}
                    className="text-white/80 hover:text-white p-2.5 -m-1"
                    aria-label="안내 다시 보기"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.5 9.5a2.5 2.5 0 015 0c0 1-.5 1.7-1.5 2.3-.8.5-1 1-1 1.7M12 17h.01"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeLightbox();
                  }}
                  className="text-white/80 hover:text-white p-2.5 -m-1"
                  aria-label="닫기"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
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
            </div>

            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <div
                className={`w-full h-full ${
                  edgeShake === "start"
                    ? "lightbox-slide-bounce-prev"
                    : edgeShake === "end"
                      ? "lightbox-slide-bounce-next"
                      : ""
                }`}
              >
              <Swiper
                modules={[Keyboard, Virtual]}
                virtual={{
                  enabled: true,
                  addSlidesBefore: 2,
                  addSlidesAfter: 2,
                }}
                keyboard={{ enabled: true }}
                initialSlide={slideIndex}
                slidesPerView={1}
                className="w-full h-full"
                onSwiper={(s) => {
                  swiperRef.current = s;
                }}
                onSlideChange={(swiper) => {
                  setSlideIndex(swiper.realIndex);
                }}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index} virtualIndex={index}>
                    <div className="relative w-full h-full">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        quality={85}
                        onContextMenu={preventContextMenu}
                        draggable={false}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              </div>

              {/* 좌/우 영역 — pointer 이벤트로 tap(버튼)과 swipe(슬라이드 전환) 둘 다 지원 */}
              <button
                type="button"
                onPointerDown={(e) => {
                  navPointerRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    t: performance.now(),
                  };
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  const start = navPointerRef.current;
                  navPointerRef.current = null;
                  if (!start) return;
                  const dx = e.clientX - start.x;
                  const dy = e.clientY - start.y;
                  const isTap =
                    Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD;
                  const isHorizontalSwipe =
                    Math.abs(dx) > SWIPE_THRESHOLD &&
                    Math.abs(dx) > Math.abs(dy);

                  if (isTap) {
                    if (slideIndex === 0) triggerEdgeShake("start");
                    else swiperRef.current?.slidePrev();
                  } else if (isHorizontalSwipe) {
                    if (dx > 0) {
                      if (slideIndex === 0) triggerEdgeShake("start");
                      else swiperRef.current?.slidePrev();
                    } else {
                      if (slideIndex === images.length - 1)
                        triggerEdgeShake("end");
                      else swiperRef.current?.slideNext();
                    }
                  }
                }}
                onPointerCancel={() => {
                  navPointerRef.current = null;
                }}
                style={{ minHeight: "auto", touchAction: "pan-y" }}
                className="absolute left-0 top-[15%] bottom-[15%] w-[20%] z-10 group flex items-center justify-start pl-2"
                aria-label={slideIndex === 0 ? "처음 사진입니다" : "이전 사진"}
              >
                <span
                  key={`prev-${edgeShake === "start" ? edgeShakeNonce : "idle"}`}
                  className={`transition-opacity bg-black/40 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center ${
                    edgeShake === "start"
                      ? "opacity-100 text-white/60"
                      : slideIndex === 0
                        ? "opacity-0"
                        : "opacity-0 group-hover:opacity-100 group-active:opacity-100 text-white/90"
                  }`}
                >
                  {edgeShake === "start" ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M5.6 5.6l12.8 12.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                </span>
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  navPointerRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    t: performance.now(),
                  };
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  const start = navPointerRef.current;
                  navPointerRef.current = null;
                  if (!start) return;
                  const dx = e.clientX - start.x;
                  const dy = e.clientY - start.y;
                  const isTap =
                    Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD;
                  const isHorizontalSwipe =
                    Math.abs(dx) > SWIPE_THRESHOLD &&
                    Math.abs(dx) > Math.abs(dy);

                  if (isTap) {
                    if (slideIndex === images.length - 1)
                      triggerEdgeShake("end");
                    else swiperRef.current?.slideNext();
                  } else if (isHorizontalSwipe) {
                    if (dx > 0) {
                      if (slideIndex === 0) triggerEdgeShake("start");
                      else swiperRef.current?.slidePrev();
                    } else {
                      if (slideIndex === images.length - 1)
                        triggerEdgeShake("end");
                      else swiperRef.current?.slideNext();
                    }
                  }
                }}
                onPointerCancel={() => {
                  navPointerRef.current = null;
                }}
                style={{ minHeight: "auto", touchAction: "pan-y" }}
                className="absolute right-0 top-[15%] bottom-[15%] w-[20%] z-10 group flex items-center justify-end pr-2"
                aria-label={slideIndex === images.length - 1 ? "마지막 사진입니다" : "다음 사진"}
              >
                <span
                  key={`next-${edgeShake === "end" ? edgeShakeNonce : "idle"}`}
                  className={`transition-opacity bg-black/40 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center ${
                    edgeShake === "end"
                      ? "opacity-100 text-white/60"
                      : slideIndex === images.length - 1
                        ? "opacity-0"
                        : "opacity-0 group-hover:opacity-100 group-active:opacity-100 text-white/90"
                  }`}
                >
                  {edgeShake === "end" ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M5.6 5.6l12.8 12.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
              </button>

              {/* 가로 사진 첫 진입 안내 — 가벼운 튜토리얼 (라이트박스 내 중앙 카드 + dim + 휴대폰 회전 애니메이션 1회) */}
              <AnimatePresence>
                {rotateHintOpen && (
                  <motion.div
                    className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 backdrop-blur-[2px] px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissRotateHint();
                    }}
                  >
                    <motion.div
                      className="relative max-w-[280px] w-full bg-bg-card text-text rounded-2xl shadow-2xl px-6 py-5 text-center"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center mb-3">
                        <span className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <motion.span
                            className="inline-flex"
                            initial={{ rotate: 0, opacity: 1 }}
                            animate={{
                              rotate: [0, -90, -90, 0, 0, 0],
                              opacity: [1, 1, 0, 0, 1, 1],
                            }}
                            transition={{
                              duration: 3,
                              times: [0, 0.33, 0.45, 0.55, 0.7, 1],
                              ease: "easeInOut",
                              repeat: Infinity,
                            }}
                          >
                            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <rect x="6" y="2" width="12" height="20" rx="2.5" />
                              <path strokeLinecap="round" d="M10.5 5h3M11.5 19h1" />
                            </svg>
                          </motion.span>
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text mb-1.5">
                        가로로 보기
                      </p>
                      <p className="text-xs text-text-light leading-relaxed">
                        휴대폰을 가로로 돌려 보세요
                        <br />
                        자동 회전이 꺼져 있다면 잠금을 해제해 주세요
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissRotateHint();
                        }}
                        className="mt-4 w-full text-xs text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition-colors"
                        style={{ minHeight: "auto" }}
                      >
                        확인
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 text-center px-4 pb-6 pt-10 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white/80 text-sm font-serif font-light tracking-wider">
                {images[slideIndex].alt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
